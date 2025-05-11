const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // You need to install this: npm install cors
require('dotenv').config();
const app = express();
const port = 3000;

// Enable CORS for the frontend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Get token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GitHub token not found. Please set GITHUB_TOKEN in your .env file.');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'User-Agent': 'mergestats-script'
};

// Helper function to get the last day of a month
function getLastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

async function fetchPRs(username, startDate, endDate, page = 1, allPRs = []) {
  try {
    const searchUrl = `https://api.github.com/search/issues?q=type:pr+author:${username}+created:${startDate}..${endDate}&per_page=100&page=${page}`;
    console.log(`Fetching page ${page}...`);
    
    const response = await fetch(searchUrl, { headers });
    
    // Check for rate limiting
    const rateLimit = {
      limit: response.headers.get('x-ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining'),
      reset: response.headers.get('x-ratelimit-reset')
    };
    
    if (rateLimit.remaining === '0') {
      const resetDate = new Date(rateLimit.reset * 1000);
      console.error(`Rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
      throw new Error(`GitHub API rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`);
    }
    
    const data = await response.json();
    
    if (data.message) {
      console.error("Error from GitHub API:", data.message);
      throw new Error(`GitHub API error: ${data.message}`);
    }
    
    // Handle no results case
    if (!data.items || data.items.length === 0) {
      console.log(`No PRs found for user ${username} in the given time period.`);
      return allPRs;
    }
    
    const combinedPRs = [...allPRs, ...data.items];
    
    // GitHub search API has a limit of 1000 results (10 pages of 100)
    if (data.items.length === 100 && page < 10) {
      return fetchPRs(username, startDate, endDate, page + 1, combinedPRs);
    }
    
    return combinedPRs;
  } catch (error) {
    console.error("Error fetching PRs:", error.message);
    throw error;
  }
}

async function getPRDetails(prs) {
  const prDetails = [];
  
  for (let i = 0; i < prs.length; i++) {
    const pr = prs[i];
    try {
      console.log(`Fetching details for PR ${i+1}/${prs.length}: ${pr.title}`);
      
      // Extract repo name from repository_url
      const repoFullName = pr.repository_url.split('/repos/')[1];
      const prNumber = pr.number;
      const prUrl = `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`;
      
      const response = await fetch(prUrl, { headers });
      
      // Check for rate limiting
      const rateLimit = {
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset')
      };
      
      if (rateLimit.remaining === '0') {
        const resetDate = new Date(rateLimit.reset * 1000);
        console.error(`Rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
        throw new Error(`GitHub API rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`);
      }
      
      const prData = await response.json();
      
      if (prData.message) {
        console.error("Error:", prData.message);
        continue;
      }
      
      prDetails.push({
        title: pr.title,
        number: pr.number,
        repo: repoFullName,
        merged: prData.merged === true,
        state: prData.state,
        created_at: pr.created_at,
        merged_at: prData.merged_at,
        closed_at: prData.closed_at,
        url: pr.html_url
      });
      
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing PR ${pr.number}:`, error.message);
    }
  }
  
  return prDetails;
}

async function generateStats(prDetails) {
  const totalPRs = prDetails.length;
  const mergedPRs = prDetails.filter(pr => pr.merged);
  const closedPRs = prDetails.filter(pr => !pr.merged && pr.state === 'closed');
  const openPRs = prDetails.filter(pr => pr.state === 'open');
  
  const repos = {};
  prDetails.forEach(pr => {
    if (!repos[pr.repo]) {
      repos[pr.repo] = { total: 0, merged: 0 };
    }
    repos[pr.repo].total++;
    if (pr.merged) repos[pr.repo].merged++;
  });
  
  return {
    totalPRs,
    mergedPRs: mergedPRs.length,
    closedPRs: closedPRs.length,
    openPRs: openPRs.length,
    repos
  };
}

// Add a route for the root path
app.get('/', (req, res) => {
  res.send('MergeStats API is running! Use /api/stats endpoint for data.');
});

// Create API endpoint to get PR stats (only defined once)
app.post('/api/stats', async (req, res) => {
  try {
    console.log("Received request:", req.body);
    const { username, year, month } = req.body;
    
    if (!username || !year || !month) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);
    
    if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month. Please enter a number between 1 and 12." });
    }
    
    if (isNaN(yearInt) || yearInt < 2000 || yearInt > new Date().getFullYear()) {
      return res.status(400).json({ error: "Invalid year." });
    }
    
    const monthStr = monthInt.toString().padStart(2, '0');
    const startDate = `${yearInt}-${monthStr}-01`;
    const lastDay = getLastDayOfMonth(yearInt, monthInt);
    const endDate = `${yearInt}-${monthStr}-${lastDay}`;
    
    console.log(`Processing request for ${username}, period ${monthStr}/${yearInt} (${startDate} to ${endDate})`);
    
    const prs = await fetchPRs(username, startDate, endDate);
    
    if (prs.length === 0) {
      return res.json({
        username,
        period: `${monthStr}/${yearInt}`,
        stats: {
          totalPRs: 0,
          mergedPRs: 0,
          closedPRs: 0,
          openPRs: 0,
          repos: {}
        },
        prDetails: []
      });
    }
    
    const prDetails = await getPRDetails(prs);
    const stats = await generateStats(prDetails);
    
    res.json({
      username,
      period: `${monthStr}/${yearInt}`,
      stats,
      prDetails
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add a test endpoint that can be accessed from a browser


app.listen(port, () => {
  console.log(`MergeStats API running on http://localhost:${port}`);
});