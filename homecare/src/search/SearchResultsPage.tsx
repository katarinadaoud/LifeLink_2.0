import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import './SearchResult.css';

interface SearchResult {
  type: 'appointment' | 'medication' | 'profile';
  id: string;
  title: string;
  description: string;
  date?: string;
  details?: any;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (!query) {
      navigate('/');
      return;
    }
    performSearch(query);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    const searchResults: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    //simple category-based search
    if (query.includes('appointment') || query.includes('avtale') || query.includes('booking')) {
      searchResults.push({
        type: 'appointment',
        id: 'appointments',
        title: 'Appointments',
        description: 'View and manage your appointments',
        details: null
      });
    }

    if (query.includes('medication') || query.includes('medicine') || query.includes('pills')) {
      searchResults.push({
        type: 'medication',
        id: 'medications',
        title: 'Medications',
        description: 'View and manage your medications',
        details: null
      });
    }

    if (query.includes('profile') || query.includes('settings') || query.includes('account')) {
      searchResults.push({
        type: 'profile',
        id: 'profile',
        title: 'My Profile',
        description: 'View and edit your personal information',
        details: null
      });
    }

    setResults(searchResults);
    setLoading(false);
  };

  //navigation when clicking on result
  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'appointment':
        navigate('/appointments');
        break;
      case 'medication':
        navigate('/medications');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  //you have to be logged in to search
  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Please log in to search.
        </Alert>
      </Container>
    );
  }


  //the view for search results
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="search-results-title">
            Search Results for "{query}"
          </h2>
          
          {loading && (
            <div className="search-loading-container">
              <Spinner animation="border" role="status" className="search-loading-spinner">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="search-loading-text">Searching...</p>
            </div>
          )}
          
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}
          
          {!loading && !error && (
            <>
              <p className="search-results-count">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              
              {results.length === 0 ? (
                <Alert variant="info">
                  <h5>No results found</h5>
                  <p>Try searching with different keywords or check your spelling.</p>
                  <Button className="btn btn-teal" onClick={() => navigate('/')}>
                    Go to Home
                  </Button>
                </Alert>
              ) : (
                <Row>
                  {results.map((result, index) => (
                    <Col md={6} lg={4} key={`${result.type}-${result.id}-${index}`} className="mb-3">
                      <Card 
                        className="search-result-card"
                        onClick={() => handleResultClick(result)}
                      >
                        <Card.Header className="search-result-card-header">
                          {result.type}
                        </Card.Header>
                        <Card.Body>
                          <Card.Title className="search-result-card-title">
                            {result.title}
                          </Card.Title>
                          <Card.Text className="search-result-card-text">
                            {result.description}
                          </Card.Text>
                          {result.date && (
                            <Card.Text>
                              <small className="search-result-date">Date: {result.date}</small>
                            </Card.Text>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchResultsPage;