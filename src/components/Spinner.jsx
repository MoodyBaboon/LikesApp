import React from 'react';
import { Row, Col } from "react-bootstrap";

function Spinner() {
    return (
        <Row>
            <Col md={12} sm={4}>
                <div className="showbox">
                    <div className="loader">
                        <svg className="circular" viewBox="25 25 50 50">
                            <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
                        </svg>
                    </div>
                </div>
            </Col>
        </Row>
    )
}

export default Spinner;