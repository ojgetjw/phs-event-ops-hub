/**
 * Arbiter Live Scraper
 * Fetches PHS athletics games and syncs to Supabase
 * 
 * Usage:
 *   node arbiter-scraper.js
 * 
 * Environment:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Service role key (for insecure_skip_verify)
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const ARBITER_URL = 'https://www.arbiterlive.com/School/17783';
const SCHOOL_ID = '17783';
const TEAMS_TO_SCRAPE = 5; // Limit for performance

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseGameFromText(text) {
  // Match date/time patterns like "Fri Aug 21 6:00 PM"
  const dateTimeMatch = text.match(/(\w+\s+\w+\s+\d{1,2}\s+\d{1,2}:\d{2}\s+(?:AM|PM))/);
  if (!dateTimeMatch) return null;

  // Extract opponent (after vs or @)
  const opponentMatch = text.match(/(?:vs|@)\s+([A-Za-z\s&-]+?)(?:\s+at\s|$)/i);
  if (!opponentMatch) return null;

  const dateTimeStr = dateTimeMatch[1];
  const opponent = opponentMatch[1].replace(/High School$/, '').trim();
  
  return {
    dateTime: dateTimeStr,
    opponent: opponent,
    raw: text
  };
}

async function scrapeTeamSchedules() {
  try {
    console.log('[' + new Date().toISOString() + '] Fetching Arbiter Live...');
    
    const html = await fetchHtml(ARBITER_URL);
    
    // Extract team links: /Teams/Schedule/XXXXX
    const teamLinkMatches = [...html.matchAll(/href="\/Teams\/Schedule\/(\d+)"/g)];
    const teamIds = [...new Set(teamLinkMatches.map(m => m[1]))].slice(0, TEAMS_TO_SCRAPE);
    
    console.log(`Found ${teamIds.length} teams to scrape`);

    const games = [];
    const seen = new Set();

    for (const teamId of teamIds) {
      try {
        const teamUrl = `https://www.arbiterlive.com/Teams/Schedule/${teamId}`;
        const teamHtml = await fetchHtml(teamUrl);

        // Extract team name from HTML (between <h1> or similar)
        const teamNameMatch = teamHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const teamName = teamNameMatch ? teamNameMatch[1].trim() : `Team ${teamId}`;

        // Extract games from schedule table
        // Look for patterns with date/time, opponent, location
        const gameMatches = [...teamHtml.matchAll(
          /(?:Fri|Mon|Tue|Wed|Thu|Sat|Sun)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{1,2}:\d{2}\s+(?:AM|PM)[^<]*(?:vs|@)\s+([^<\n]+)/gi
        )];

        for (const match of gameMatches) {
          const gameText = match[0];
          const game = parseGameFromText(gameText);
          
          if (!game) continue;

          // Deduplicate by opponent + date
          const key = `${game.dateTime}|${game.opponent}`;
          if (seen.has(key)) continue;
          seen.add(key);

          games.push({
            dateTime: game.dateTime,
            opponent: game.opponent,
            sport: extractSport(teamName),
            team: teamName
          });
        }

        console.log(`✓ Scraped ${teamName}: ${gameMatches.length} games`);

      } catch (teamError) {
        console.warn(`⚠ Failed to scrape team ${teamId}:`, teamError.message);
      }
    }

    console.log(`Total unique games found: ${games.length}`);
    return games;

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    throw error;
  }
}

function extractSport(teamName) {
  const sports = ['Football', 'Basketball', 'Soccer', 'Volleyball', 'Baseball', 'Softball', 'Tennis', 'Swimming', 'Field Hockey', 'Cross Country', 'Golf'];
  for (const sport of sports) {
    if (teamName.toUpperCase().includes(sport.toUpperCase())) {
      return sport;
    }
  }
  return 'Athletics';
}

function parseDateTime(dateTimeStr) {
  // "Fri Aug 21 6:00 PM" -> "2025-08-21" and "18:00"
  const currentYear = new Date().getFullYear();
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };

  const match = dateTimeStr.match(/(\w+)\s+(\w+)\s+(\d{1,2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/);
  if (!match) return null;

  const [, dayName, monthName, day, hour, min, ampm] = match;
  let h = parseInt(hour);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const month = monthMap[monthName];
  const paddedDay = String(day).padStart(2, '0');
  const paddedHour = String(h).padStart(2, '0');
  const paddedMin = String(min).padStart(2, '0');

  return {
    date: `${currentYear}-${month}-${paddedDay}`,
    time: `${paddedHour}:${paddedMin}`
  };
}

async function syncToSupabase(games) {
  console.log(`Syncing ${games.length} games to Supabase...`);

  const eventSource = await supabase
    .from('event_sources')
    .select('id')
    .eq('source_type', 'arbiter_live')
    .single();

  for (const game of games) {
    try {
      const parsed = parseDateTime(game.dateTime);
      if (!parsed) {
        console.warn(`⚠ Could not parse: ${game.dateTimeStr}`);
        continue;
      }

      const eventId = `arbiter_${game.sport.toLowerCase()}_${game.opponent.toLowerCase()}_${parsed.date}`;

      const eventData = {
        event_id: eventId,
        title: `${game.sport}: vs ${game.opponent}`,
        category: 'Athletics',
        event_date: parsed.date,
        start_time: parsed.time,
        end_time: addHours(parsed.time, 2),
        source: 'arbiter_live',
        source_id: eventId,
        workflow_status: 'Imported',
        venue: 'TBA' // Would need more parsing to get actual venue
      };

      // Upsert (insert or update)
      const { error } = await supabase
        .from('events')
        .upsert(eventData, { onConflict: 'event_id' });

      if (error) {
        console.error(`❌ Failed to sync ${game.opponent}:`, error.message);
      } else {
        console.log(`✓ Synced: ${game.sport} vs ${game.opponent} (${parsed.date})`);
      }

    } catch (syncError) {
      console.error(`❌ Sync error for ${game.opponent}:`, syncError.message);
    }
  }

  // Update last_sync timestamp
  await supabase
    .from('event_sources')
    .update({ last_sync: new Date().toISOString() })
    .eq('source_type', 'arbiter_live');

  console.log('✓ Sync complete');
}

function addHours(time, hours) {
  const [h, m] = time.split(':').map(Number);
  const newH = (h + hours) % 24;
  return String(newH).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

async function run() {
  try {
    const games = await scrapeTeamSchedules();
    await syncToSupabase(games);
    console.log('✓ Arbiter sync complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

run();
