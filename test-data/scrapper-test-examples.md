# Test Data for Scrapper API

## Valid JSON for Testing

```json
{
  "search": "node js",
  "ctc": "3to6",
  "jobAge": 1,
  "jobs": ["Node.js Development"],
  "work_from_home": true,
  "hybrid": true,
  "work_from_office": false,
  "maxJobs": 5,
  "start_date": "2025-04-01",
  "max_duration": 6,
  "job_offer": false,
  "locations": ["Delhi", "Mumbai"],
  "page": 1,
  "size": 10
}
```

## cURL Commands for Testing

### Internshala API
```bash
curl -X POST "http://localhost:3000/scrapper/internshala" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "node js",
    "jobs": ["Node.js Development"],
    "work_from_home": true,
    "maxJobs": 5,
    "start_date": "2025-04-01",
    "max_duration": 6,
    "job_offer": false,
    "locations": ["Delhi", "Mumbai"],
    "page": 1,
    "size": 10
  }'
```

### Naukri API
```bash
curl -X POST "http://localhost:3000/scrapper/naukri" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "node js",
    "ctc": "3to6",
    "jobAge": 1,
    "work_from_home": true,
    "hybrid": true,
    "work_from_office": false,
    "maxJobs": 5,
    "page": 1,
    "size": 10
  }'
```

## Postman Examples

### Internshala Request
- Method: POST
- URL: http://localhost:3000/scrapper/internshala
- Headers:
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "search": "node js",
  "jobs": ["Node.js Development"],
  "work_from_home": true,
  "maxJobs": 5,
  "start_date": "2025-04-01",
  "max_duration": 6,
  "job_offer": false,
  "locations": ["Delhi", "Mumbai"],
  "page": 1,
  "size": 10
}
```

### Naukri Request
- Method: POST
- URL: http://localhost:3000/scrapper/naukri
- Headers:
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "search": "node js",
  "ctc": "3to6",
  "jobAge": 1,
  "work_from_home": true,
  "hybrid": true,
  "work_from_office": false,
  "maxJobs": 5,
  "page": 1,
  "size": 10
}
```

## Fetch API Example (JavaScript)

```javascript
// Internshala Request
async function fetchInternshalaJobs() {
  const response = await fetch('http://localhost:3000/scrapper/internshala', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "search": "node js",
      "jobs": ["Node.js Development"],
      "work_from_home": true,
      "maxJobs": 5,
      "start_date": "2025-04-01",
      "max_duration": 6,
      "job_offer": false,
      "locations": ["Delhi", "Mumbai"],
      "page": 1,
      "size": 10
    }),
  });
  
  const data = await response.json();
  console.log(data);
}

// Naukri Request
async function fetchNaukriJobs() {
  const response = await fetch('http://localhost:3000/scrapper/naukri', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "search": "node js",
      "ctc": "3to6",
      "jobAge": 1,
      "work_from_home": true,
      "hybrid": true,
      "work_from_office": false,
      "maxJobs": 5,
      "page": 1,
      "size": 10
    }),
  });
  
  const data = await response.json();
  console.log(data);
}
```

## Axios Example (JavaScript)

```javascript
const axios = require('axios');

// Internshala Request
async function fetchInternshalaJobs() {
  try {
    const response = await axios.post('http://localhost:3000/scrapper/internshala', {
      search: "node js",
      jobs: ["Node.js Development"],
      work_from_home: true,
      maxJobs: 5,
      start_date: "2025-04-01",
      max_duration: 6,
      job_offer: false,
      locations: ["Delhi", "Mumbai"],
      page: 1,
      size: 10
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching internships:', error);
  }
}

// Naukri Request
async function fetchNaukriJobs() {
  try {
    const response = await axios.post('http://localhost:3000/scrapper/naukri', {
      search: "node js",
      ctc: "3to6",
      jobAge: 1,
      work_from_home: true,
      hybrid: true,
      work_from_office: false,
      maxJobs: 5,
      page: 1,
      size: 10
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
}
```