import pytest
from app import create_app

@pytest.fixture
def client():
    """Create a test client for the app."""
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'healthy'

def test_job_verification_endpoint(client):
    """Test the job verification endpoint."""
    response = client.post('/verify-job', json={
        'job_details': {
            'title': 'Software Engineer',
            'description': 'Looking for a skilled software engineer...',
            'company_name': 'Tech Corp',
            'location': 'San Francisco, CA',
            'salary': '120000-150000'
        }
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert 'prediction' in json_data
    assert 'confidence' in json_data

def test_user_clustering_endpoint(client):
    """Test the user clustering endpoint."""
    response = client.post('/recommend', json={
        'user_data': {
            'login_frequency': 5,
            'job_views': 25,
            'application_rate': 0.3,
            'remote_preference': 4,
            'salary_importance': 3,
            'profile_completeness': 85
        }
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert 'cluster' in json_data
    assert 'recommendations' in json_data

def test_skill_extraction_endpoint(client):
    """Test the skill extraction endpoint."""
    response = client.post('/extract-skills', json={
        'text': 'Experienced software engineer with 5 years of Python development. '
                'Proficient in Django, Flask, and FastAPI frameworks. '
                'Experience with AWS, Docker, and CI/CD pipelines.'
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert 'skills' in json_data
    assert len(json_data['skills']) > 0