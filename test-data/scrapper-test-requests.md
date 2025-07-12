// filepath: c:\Projects\jobquest\jobquestbackend\test-data\scrapper-test-requests.md
# Test Requests for Scrapper API

## Internshala API Requests

### Basic Search for Web Development Internships
```json
POST /scrapper/internshala
Content-Type: application/json

{
  "search": "web development"
}
```

### Search with Multiple Parameters
```json
POST /scrapper/internshala
Content-Type: application/json

{
  "search": "software engineer",
  "work_from_home": true,
  "page": 1,
  "size": 10
}
```

### Search by Location
```json
POST /scrapper/internshala
Content-Type: application/json

{
  "locations": ["delhi", "bangalore"]
}
```

### Search with Duration and Start Date
```json
POST /scrapper/internshala
Content-Type: application/json

{
  "max_duration": 3,
  "start_date": "2023-06-01"
}
```

### Search with Job Types
```json
POST /scrapper/internshala
Content-Type: application/json

{
  "jobs": ["web development", "machine learning"]
}
```

## Naukri API Requests

### Basic Search for Software Engineer Jobs
```json
POST /scrapper/naukri
Content-Type: application/json

{
  "search": "software engineer"
}
```

### Search with Work Mode Options
```json
POST /scrapper/naukri
Content-Type: application/json

{
  "search": "data scientist",
  "work_from_home": true
}
```

### Search with Hybrid Work Option
```json
POST /scrapper/naukri
Content-Type: application/json

{
  "search": "product manager",
  "hybrid": true
}
```

### Search with Office Work Option
```json
POST /scrapper/naukri
Content-Type: application/json

{
  "search": "ui designer",
  "work_from_office": true
}
```

### Search with Job Age
```json
POST /scrapper/naukri
Content-Type: application/json

{
  "search": "javascript developer",
  "jobAge": 3
}
```

### Paginated Search
```json
POST /scrapper/naukri
Content-Type: application/json

{
  "search": "python developer",
  "page": 2,
  "size": 15
}
```

## Example cURL Commands

### Internshala Search
```bash
curl -X POST "http://localhost:3000/scrapper/internshala" \
  -H "Content-Type: application/json" \
  -d '{"search":"web development","work_from_home":true,"page":1,"size":10}'
```

### Naukri Search
```bash
curl -X POST "http://localhost:3000/scrapper/naukri" \
  -H "Content-Type: application/json" \
  -d '{"search":"software engineer","work_from_home":true}'
```

## Example Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Successfully scraped 10 internships",
  "data": [
    {
      "title": "Web Development Internship",
      "link": "https://internshala.com/internship/detail/web-development-internship-in-delhi-at-example-company",
      "companyName": "Example Company",
      "location": "Delhi",
      "duration": "3 Months",
      "stipend": "₹10,000 /month",
      "earlyApplicant": true,
      "skills": ["HTML", "CSS", "JavaScript", "React"],
      "jobDescription": "We are looking for a web developer intern...",
      "aboutCompany": "Example Company is a leading tech firm...",
      "numberOfOpenings": "5"
    },
    // More results...
  ],
  "page": 1,
  "size": 10,
  "total": 50,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error during scraping: Failed to fetch data",
  "data": []
}
```