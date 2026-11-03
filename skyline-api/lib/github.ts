export interface DayData {
  date: string;
  count: number;
  weekday: number; // 0 = Sun, 6 = Sat
}

export interface WeekData {
  weekIndex: number;
  days: DayData[];
  total: number;
  maxDay: number;
  hasActivity: boolean;
  month: string;
}

export interface GitHubTelemetry {
  username: string;
  totalContributions: number;
  weeks: WeekData[];
  days: DayData[];
  streak: number;
  peakDay: { date: string; count: number; weekIndex: number };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function generateSyntheticTelemetry(username: string = 'Cipher-Shadow-IR'): GitHubTelemetry {
  const days: DayData[] = [];
  const weeks: WeekData[] = [];
  const now = new Date();
  
  let totalContributions = 0;
  let peakDay = { date: '', count: 0, weekIndex: 0 };
  
  // 52 weeks * 7 days = 364 days
  for (let w = 0; w < 52; w++) {
    const weekDays: DayData[] = [];
    let weekTotal = 0;
    let weekMax = 0;
    let weekMonth = '';

    for (let d = 0; d < 7; d++) {
      const dayOffset = (51 - w) * 7 + (6 - d);
      const dayDate = new Date(now.getTime() - dayOffset * 86400000);
      const dateStr = dayDate.toISOString().split('T')[0];
      if (d === 0) {
        weekMonth = MONTH_NAMES[dayDate.getUTCMonth()];
      }

      // Procedural activity wave
      const phase = Math.sin((w / 52) * Math.PI * 2) * 0.5 + 0.5;
      const noise = ((w * 17 + d * 31) % 100) / 100;
      let count = 0;

      if (noise > 0.45) {
        count = Math.floor(noise * 4 * phase) + 1;
      }
      if (w === 42 && d === 5) count = 51; // Peak Boss Milestone
      if (w >= 49 && noise > 0.3) count = Math.floor(noise * 8) + 2;

      weekDays.push({ date: dateStr, count, weekday: d });
      days.push({ date: dateStr, count, weekday: d });
      weekTotal += count;
      weekMax = Math.max(weekMax, count);
      totalContributions += count;

      if (count > peakDay.count) {
        peakDay = { date: dateStr, count, weekIndex: w };
      }
    }

    weeks.push({
      weekIndex: w,
      days: weekDays,
      total: weekTotal,
      maxDay: weekMax,
      hasActivity: weekTotal > 0,
      month: weekMonth,
    });
  }

  // Calculate streak from latest days backwards
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else if (streak > 0) break;
  }

  return {
    username,
    totalContributions: Math.max(584, totalContributions),
    weeks,
    days,
    streak: Math.max(3, streak),
    peakDay,
  };
}

export async function fetchGitHubTelemetry(
  username: string,
  token?: string,
  forceDemo: boolean = false
): Promise<GitHubTelemetry> {
  if (forceDemo) {
    return generateSyntheticTelemetry(username);
  }

  const effectiveToken = token || process.env.GITHUB_TOKEN;

  // Attempt 1: GitHub GraphQL API if token is provided
  if (effectiveToken) {
    try {
      const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
      `;
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
          'User-Agent': 'CipherShadow-Visuals',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables: { login: username } }),
        ...({ next: { revalidate: 3600 } } as any),
      });

      if (res.ok) {
        const json = await res.json();
        const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
        if (cal && cal.weeks) {
          return parseCalendarWeeks(username, cal.totalContributions, cal.weeks);
        }
      }
    } catch {
      // Fallback to public endpoint
    }
  }

  // Attempt 2: Public GitHub HTML Scraper (No Token Required!)
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      ...({ next: { revalidate: 3600 } } as any),
    });

    if (res.ok) {
      const html = await res.text();
      return parsePublicContributionsHtml(username, html);
    }
  } catch {
    // Fallback to synthetic
  }

  return generateSyntheticTelemetry(username);
}

function parseCalendarWeeks(username: string, totalContributions: number, rawWeeks: any[]): GitHubTelemetry {
  const days: DayData[] = [];
  const weeks: WeekData[] = [];
  let peakDay = { date: '', count: 0, weekIndex: 0 };

  const last52 = rawWeeks.slice(-52);
  last52.forEach((w: any, wIdx: number) => {
    let weekTotal = 0;
    let weekMax = 0;
    let weekMonth = '';
    const weekDays: DayData[] = [];

    (w.contributionDays || []).forEach((d: any) => {
      const c = d.contributionCount || 0;
      const dt = d.date;
      const dayObj: DayData = { date: dt, count: c, weekday: d.weekday };
      weekDays.push(dayObj);
      days.push(dayObj);
      weekTotal += c;
      weekMax = Math.max(weekMax, c);
      if (!weekMonth && dt) {
        const mIdx = parseInt(dt.split('-')[1], 10) - 1;
        weekMonth = MONTH_NAMES[mIdx] || '';
      }
      if (c > peakDay.count) {
        peakDay = { date: dt, count: c, weekIndex: wIdx };
      }
    });

    weeks.push({
      weekIndex: wIdx,
      days: weekDays,
      total: weekTotal,
      maxDay: weekMax,
      hasActivity: weekTotal > 0,
      month: weekMonth,
    });
  });

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else if (streak > 0) break;
  }

  return {
    username,
    totalContributions: totalContributions || days.reduce((a, b) => a + b.count, 0),
    weeks,
    days,
    streak: Math.max(1, streak),
    peakDay,
  };
}

function parsePublicContributionsHtml(username: string, html: string): GitHubTelemetry {
  const itemMatches = Array.from(html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"/g));
  const tipMatches = Array.from(html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>(.*?)<\/tool-tip>/gs));
  
  const tipMap = new Map<string, string>();
  tipMatches.forEach((m) => tipMap.set(m[1], m[2].trim()));

  const dayMap: Record<string, number> = {};
  itemMatches.forEach((m) => {
    const dateStr = m[1];
    const tid = m[2];
    const tip = tipMap.get(tid) || '';
    let count = 0;
    if (!tip.includes('No contributions')) {
      const numMatch = tip.match(/(\d+)\s+contribution/);
      if (numMatch) count = parseInt(numMatch[1], 10);
    }
    dayMap[dateStr] = count;
  });

  const sortedDates = Object.keys(dayMap).sort();
  const targetDates = sortedDates.slice(-364);

  const days: DayData[] = [];
  const weeks: WeekData[] = [];
  let totalContributions = 0;
  let peakDay = { date: '', count: 0, weekIndex: 0 };

  for (let w = 0; w < 52; w++) {
    const weekDays: DayData[] = [];
    let weekTotal = 0;
    let weekMax = 0;
    let weekMonth = '';

    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const dateStr = targetDates[idx] || '';
      const count = dayMap[dateStr] || 0;
      const dayObj: DayData = { date: dateStr, count, weekday: d };
      weekDays.push(dayObj);
      days.push(dayObj);
      weekTotal += count;
      weekMax = Math.max(weekMax, count);
      totalContributions += count;

      if (d === 0 && dateStr) {
        const mIdx = parseInt(dateStr.split('-')[1], 10) - 1;
        weekMonth = MONTH_NAMES[mIdx] || '';
      }
      if (count > peakDay.count) {
        peakDay = { date: dateStr, count, weekIndex: w };
      }
    }

    weeks.push({
      weekIndex: w,
      days: weekDays,
      total: weekTotal,
      maxDay: weekMax,
      hasActivity: weekTotal > 0,
      month: weekMonth,
    });
  }

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else if (streak > 0) break;
  }

  return {
    username,
    totalContributions,
    weeks,
    days,
    streak: Math.max(1, streak),
    peakDay,
  };
}
