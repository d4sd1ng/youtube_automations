import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Billing.css';

const Billing = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Simulate fetching plans
      const simulatedPlans = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          requestsPerDay: 100,
          features: ['Basic SEO optimization', 'Limited API access']
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 29.99,
          requestsPerDay: 1000,
          features: ['Advanced SEO optimization', 'Full API access', 'Priority support']
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 99.99,
          requestsPerDay: 10000,
          features: ['All Pro features', 'Custom integrations', 'Dedicated support', 'SLA']
        }
      ];

      setPlans(simulatedPlans);
    } catch (err) {
      setError('Failed to fetch plans');
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleInputChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Payment processed successfully! Your plan has been updated.');
      setLoading(false);
    } catch (err) {
      setError('Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <div className="billing">
      <h1>Billing & Plans</h1>

      <div className="plans-section">
        <h2>Choose a Plan</h2>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <h3>{plan.name}</h3>
              <div className="plan-price">
                {plan.price === 0 ? 'Free' : `€${plan.price}/month`}
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="plan-requests">
                {plan.requestsPerDay} requests/day
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && selectedPlan !== 'free' && (
        <div className="payment-section">
          <h2>Payment Information</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handlePaymentSubmit}>
            <div className="form-group">
              <label>Name on Card</label>
              <input
                type="text"
                name="name"
                value={billingInfo.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={billingInfo.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={billingInfo.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={billingInfo.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={billingInfo.cvv}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : `Subscribe to ${plans.find(p => p.id === selectedPlan)?.name}`}
            </button>
          </form>
        </div>
      )}

      {selectedPlan && selectedPlan === 'free' && (
        <div className="free-plan-message">
          <h3>You have selected the Free plan</h3>
          <p>No payment required. Enjoy your free access to basic features!</p>
        </div>
      )}
    </div>
  );
};

export default Billing;