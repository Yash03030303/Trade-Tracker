// src/pages/AIAnalysisPage.js
import React, { useState } from 'react';
import { Card, Button, Form, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';

// Backend API URL — change this to your Render URL after deployment
const API_URL = process.env.REACT_APP_AI_API_URL;

const AIAnalysisPage = () => {
    const query = "Can you tell me last week's trade analysis?";
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-calculate last 7 days
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        setAnalysis('');

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                setError('You must be logged in to generate analysis.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/weekly-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.uid,
                    start_date: startDate,
                    end_date: endDate,
                    query: query,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Failed to generate analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Simple markdown-like formatting for the analysis text
    const formatAnalysis = (text) => {
        if (!text) return null;

        return text.split('\n').map((line, index) => {
            // Bold headers (lines starting with **)
            if (line.match(/^\*\*.*\*\*$/)) {
                return <h5 key={index} style={{ marginTop: '1rem', color: '#667eea' }}>{line.replace(/\*\*/g, '')}</h5>;
            }
            // Section headers with emoji
            if (line.match(/^#+\s/)) {
                return <h5 key={index} style={{ marginTop: '1rem', color: '#667eea' }}>{line.replace(/^#+\s/, '')}</h5>;
            }
            // Bold text within lines
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={index} style={{ marginBottom: '0.3rem' }}>
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                    </p>
                );
            }
            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                return <p key={index} style={{ marginBottom: '0.2rem', paddingLeft: '1rem' }}>• {line.replace(/^[\s]*[-•]\s/, '')}</p>;
            }
            // Empty lines
            if (line.trim() === '') {
                return <br key={index} />;
            }
            // Normal text
            return <p key={index} style={{ marginBottom: '0.3rem' }}>{line}</p>;
        });
    };

    return (
        <Container>
            <h4 className="page-title">🤖 AI Trade Analysis</h4>

            {/* Input Card */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <h5 className="mb-0">📊 Weekly Trade Analysis</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label><strong>Start Date</strong></Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label><strong>End Date</strong></Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="d-flex align-items-end">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            const t = new Date();
                                            const lw = new Date(t);
                                            lw.setDate(t.getDate() - 7);
                                            setStartDate(lw.toISOString().split('T')[0]);
                                            setEndDate(t.toISOString().split('T')[0]);
                                        }}
                                        className="me-2"
                                    >
                                        Last 7 Days
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            const t = new Date();
                                            const lm = new Date(t);
                                            lm.setDate(t.getDate() - 30);
                                            setStartDate(lm.toISOString().split('T')[0]);
                                            setEndDate(t.toISOString().split('T')[0]);
                                        }}
                                    >
                                        Last 30 Days
                                    </Button>
                                </Col>
                            </Row>

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    fontWeight: 600,
                                    padding: '10px 30px',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Analyzing your trades...
                                    </>
                                ) : (
                                    '🚀 Generate Weekly Analysis'
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    <Alert.Heading>Analysis Failed</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <Card className="shadow-sm mb-4">
                    <Card.Body className="text-center py-5">
                        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                        <p className="mt-3 text-muted">
                            🤖 AI is analyzing your trades... This may take 15-30 seconds.
                        </p>
                    </Card.Body>
                </Card>
            )}

            {/* Analysis Result */}
            {analysis && !loading && (
                <Row>
                    <Col md={12}>
                        <Card className="shadow-sm">
                            <Card.Header style={{
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                color: 'white'
                            }}>
                                <h5 className="mb-0">📋 Analysis Report</h5>
                            </Card.Header>
                            <Card.Body style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                {formatAnalysis(analysis)}
                            </Card.Body>
                            <Card.Footer className="text-muted text-end" style={{ fontSize: '0.8rem' }}>
                                Generated on {new Date().toLocaleString('en-IN')}
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default AIAnalysisPage;
