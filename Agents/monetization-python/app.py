from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CAMPAIGNS_DIR = os.path.join(DATA_DIR, 'campaigns')
REPORTS_DIR = os.path.join(DATA_DIR, 'reports')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CAMPAIGNS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Monetization strategies
MONETIZATION_STRATEGIES = {
    'affiliate_marketing': 'Affiliate Marketing',
    'sponsored_content': 'Sponsored Content',
    'product_sales': 'Product Sales',
    'subscriptions': 'Subscriptions',
    'ads': 'Advertising',
    'donations': 'Donations'
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Monetization Python Agent"}), 200

@app.route('/analyze-monetization-opportunities', methods=['POST'])
def analyze_monetization_opportunities():
    """Analyze monetization opportunities for content"""
    try:
        data = request.get_json()
        content_data = data.get('contentData', {})
        audience_data = data.get('audienceData', {})
        platform = data.get('platform', 'website')

        logger.info("Analyzing monetization opportunities")

        # Analyze monetization opportunities
        opportunities = analyze_monetization_opportunities_for_content(content_data, audience_data, platform)

        # Generate analysis ID
        analysis_id = str(uuid.uuid4())

        # Save analysis
        analysis = {
            'id': analysis_id,
            'contentData': content_data,
            'audienceData': audience_data,
            'platform': platform,
            'opportunities': opportunities,
            'createdAt': datetime.now().isoformat()
        }
        save_analysis(analysis)

        logger.info("Monetization opportunities analysis completed")
        return jsonify({
            "message": "Monetization opportunities analysis completed successfully",
            "analysisId": analysis_id,
            "opportunities": opportunities
        }), 200
    except Exception as e:
        logger.error(f"Monetization opportunities analysis failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/create-monetization-campaign', methods=['POST'])
def create_monetization_campaign():
    """Create a monetization campaign"""
    try:
        data = request.get_json()
        campaign_name = data.get('campaignName')
        strategy = data.get('strategy')
        content_ids = data.get('contentIds', [])
        budget = data.get('budget', 0)
        duration_days = data.get('durationDays', 30)

        if not campaign_name or not strategy:
            return jsonify({"error": "Campaign name and strategy are required"}), 400

        if strategy not in MONETIZATION_STRATEGIES:
            return jsonify({"error": f"Invalid strategy. Valid strategies: {list(MONETIZATION_STRATEGIES.keys())}"}), 400

        logger.info(f"Creating monetization campaign: {campaign_name}")

        # Create campaign
        campaign_id = str(uuid.uuid4())
        campaign = {
            'id': campaign_id,
            'name': campaign_name,
            'strategy': strategy,
            'strategyName': MONETIZATION_STRATEGIES[strategy],
            'contentIds': content_ids,
            'budget': budget,
            'durationDays': duration_days,
            'status': 'active',
            'startDate': datetime.now().isoformat(),
            'endDate': calculate_end_date(duration_days),
            'metrics': {
                'impressions': 0,
                'clicks': 0,
                'conversions': 0,
                'revenue': 0.0
            },
            'createdAt': datetime.now().isoformat()
        }

        # Save campaign
        save_campaign(campaign)

        logger.info(f"Monetization campaign created: {campaign_name}")
        return jsonify({
            "message": "Monetization campaign created successfully",
            "campaignId": campaign_id,
            "campaign": campaign
        }), 201
    except Exception as e:
        logger.error(f"Failed to create monetization campaign: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/track-campaign-performance/<campaign_id>', methods=['GET'])
def track_campaign_performance(campaign_id):
    """Track campaign performance"""
    try:
        campaign = load_campaign(campaign_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404

        logger.info(f"Tracking campaign performance: {campaign_id}")
        return jsonify({
            "message": "Campaign performance tracked successfully",
            "campaign": campaign
        }), 200
    except Exception as e:
        logger.error(f"Failed to track campaign performance: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/update-campaign-metrics/<campaign_id>', methods=['POST'])
def update_campaign_metrics(campaign_id):
    """Update campaign metrics"""
    try:
        data = request.get_json()
        metrics = data.get('metrics', {})

        campaign = load_campaign(campaign_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404

        # Update metrics
        for key, value in metrics.items():
            if key in campaign['metrics']:
                campaign['metrics'][key] = value

        campaign['updatedAt'] = datetime.now().isoformat()

        # Save updated campaign
        save_campaign(campaign)

        logger.info(f"Campaign metrics updated: {campaign_id}")
        return jsonify({
            "message": "Campaign metrics updated successfully",
            "campaign": campaign
        }), 200
    except Exception as e:
        logger.error(f"Failed to update campaign metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-monetization-report', methods=['POST'])
def generate_monetization_report():
    """Generate monetization report"""
    try:
        data = request.get_json()
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        format_type = data.get('format', 'json')

        logger.info("Generating monetization report")

        # Generate report
        report_data = generate_monetization_report_data(start_date, end_date)

        # Generate report ID
        report_id = str(uuid.uuid4())

        # Save report
        report = {
            'id': report_id,
            'startDate': start_date,
            'endDate': end_date,
            'data': report_data,
            'format': format_type,
            'createdAt': datetime.now().isoformat()
        }
        save_report(report)

        logger.info("Monetization report generated")
        return jsonify({
            "message": "Monetization report generated successfully",
            "reportId": report_id,
            "report": report_data
        }), 200
    except Exception as e:
        logger.error(f"Failed to generate monetization report: {str(e)}")
        return jsonify({"error": str(e)}), 500

def analyze_monetization_opportunities_for_content(content_data, audience_data, platform):
    """Analyze monetization opportunities for content"""
    opportunities = []

    # Content type analysis
    content_type = content_data.get('type', 'general')
    word_count = content_data.get('wordCount', 0)

    # Audience analysis
    audience_size = audience_data.get('size', 0)
    audience_interests = audience_data.get('interests', [])

    # Platform analysis
    platform_opportunities = {
        'website': ['ads', 'affiliate_marketing', 'product_sales'],
        'youtube': ['ads', 'sponsorships', 'memberships'],
        'podcast': ['sponsorships', 'subscriptions', 'donations'],
        'social_media': ['affiliate_marketing', 'sponsored_content'],
        'blog': ['ads', 'affiliate_marketing', 'product_sales']
    }

    # Determine suitable strategies based on content and audience
    suitable_strategies = platform_opportunities.get(platform, ['ads', 'affiliate_marketing'])

    for strategy in suitable_strategies:
        opportunity = {
            'strategy': strategy,
            'strategyName': MONETIZATION_STRATEGIES[strategy],
            'suitabilityScore': calculate_suitability_score(strategy, content_type, audience_size, word_count),
            'estimatedRevenue': estimate_revenue(strategy, audience_size, platform),
            'implementationDifficulty': get_implementation_difficulty(strategy),
            'recommendedActions': get_recommended_actions(strategy, content_type, platform)
        }
        opportunities.append(opportunity)

    # Sort by suitability score
    opportunities.sort(key=lambda x: x['suitabilityScore'], reverse=True)

    return opportunities

def calculate_suitability_score(strategy, content_type, audience_size, word_count):
    """Calculate suitability score for a monetization strategy"""
    score = 50  # Base score

    # Adjust based on content type
    if content_type == 'tutorial' and strategy in ['affiliate_marketing', 'product_sales']:
        score += 20
    elif content_type == 'review' and strategy == 'affiliate_marketing':
        score += 25
    elif content_type == 'entertainment' and strategy in ['ads', 'sponsorships']:
        score += 15

    # Adjust based on audience size
    if audience_size > 10000:
        score += 20
    elif audience_size > 1000:
        score += 10

    # Adjust based on word count (content depth)
    if word_count > 1000 and strategy in ['affiliate_marketing', 'product_sales']:
        score += 10

    return min(score, 100)  # Cap at 100

def estimate_revenue(strategy, audience_size, platform):
    """Estimate potential revenue for a strategy"""
    # Simplified revenue estimation
    base_cpm = {
        'website': 10,
        'youtube': 15,
        'podcast': 20,
        'social_media': 5,
        'blog': 8
    }

    cpm = base_cpm.get(platform, 10)
    estimated_impressions = audience_size * 0.1  # Assume 10% impression rate
    estimated_revenue = (estimated_impressions / 1000) * cpm

    # Adjust based on strategy
    multiplier = {
        'affiliate_marketing': 2.0,
        'sponsored_content': 1.8,
        'product_sales': 3.0,
        'subscriptions': 2.5,
        'ads': 1.0,
        'donations': 0.5
    }

    return round(estimated_revenue * multiplier.get(strategy, 1.0), 2)

def get_implementation_difficulty(strategy):
    """Get implementation difficulty for a strategy"""
    difficulty_levels = {
        'affiliate_marketing': 'Medium',
        'sponsored_content': 'Low',
        'product_sales': 'High',
        'subscriptions': 'High',
        'ads': 'Low',
        'donations': 'Low'
    }

    return difficulty_levels.get(strategy, 'Medium')

def get_recommended_actions(strategy, content_type, platform):
    """Get recommended actions for implementing a strategy"""
    recommendations = {
        'affiliate_marketing': [
            'Research relevant affiliate programs',
            'Create honest product reviews',
            'Add affiliate links naturally in content',
            'Disclose affiliate relationships'
        ],
        'sponsored_content': [
            'Reach out to brands in your niche',
            'Create a media kit',
            'Maintain editorial independence',
            'Ensure brand alignment with audience'
        ],
        'product_sales': [
            'Identify products/services to sell',
            'Set up e-commerce platform',
            'Create compelling product descriptions',
            'Implement payment processing'
        ],
        'subscriptions': [
            'Choose subscription platform',
            'Create exclusive content tiers',
            'Set pricing strategy',
            'Build subscriber community'
        ],
        'ads': [
            'Sign up for ad networks',
            'Place ads strategically',
            'Monitor ad performance',
            'Ensure good user experience'
        ],
        'donations': [
            'Set up donation platform',
            'Communicate value to audience',
            'Make donating easy and visible',
            'Thank donors publicly'
        ]
    }

    return recommendations.get(strategy, ['General implementation steps'])

def calculate_end_date(duration_days):
    """Calculate end date based on duration"""
    from datetime import timedelta
    end_date = datetime.now() + timedelta(days=duration_days)
    return end_date.isoformat()

def generate_monetization_report_data(start_date, end_date):
    """Generate monetization report data"""
    # Load all campaigns
    campaigns = load_all_campaigns()

    # Filter campaigns by date range
    filtered_campaigns = []
    for campaign in campaigns:
        campaign_start = campaign.get('startDate', '')
        if start_date <= campaign_start <= end_date:
            filtered_campaigns.append(campaign)

    # Calculate totals
    total_revenue = sum(campaign['metrics']['revenue'] for campaign in filtered_campaigns)
    total_impressions = sum(campaign['metrics']['impressions'] for campaign in filtered_campaigns)
    total_clicks = sum(campaign['metrics']['clicks'] for campaign in filtered_campaigns)
    total_conversions = sum(campaign['metrics']['conversions'] for campaign in filtered_campaigns)

    # Strategy breakdown
    strategy_breakdown = {}
    for campaign in filtered_campaigns:
        strategy = campaign['strategy']
        if strategy not in strategy_breakdown:
            strategy_breakdown[strategy] = {
                'strategyName': MONETIZATION_STRATEGIES[strategy],
                'campaignCount': 0,
                'revenue': 0,
                'impressions': 0
            }
        strategy_breakdown[strategy]['campaignCount'] += 1
        strategy_breakdown[strategy]['revenue'] += campaign['metrics']['revenue']
        strategy_breakdown[strategy]['impressions'] += campaign['metrics']['impressions']

    return {
        'period': {
            'startDate': start_date,
            'endDate': end_date
        },
        'summary': {
            'totalCampaigns': len(filtered_campaigns),
            'totalRevenue': round(total_revenue, 2),
            'totalImpressions': total_impressions,
            'totalClicks': total_clicks,
            'totalConversions': total_conversions,
            'ctr': round((total_clicks / max(total_impressions, 1)) * 100, 2),
            'conversionRate': round((total_conversions / max(total_clicks, 1)) * 100, 2)
        },
        'strategyBreakdown': strategy_breakdown,
        'topCampaigns': sorted(filtered_campaigns, key=lambda x: x['metrics']['revenue'], reverse=True)[:5]
    }

def save_analysis(analysis):
    """Save analysis to file"""
    try:
        file_path = os.path.join(REPORTS_DIR, f"{analysis['id']}_analysis.json")
        with open(file_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        logger.info(f"Analysis saved: {analysis['id']}")
    except Exception as e:
        logger.error(f"Failed to save analysis: {str(e)}")

def save_campaign(campaign):
    """Save campaign to file"""
    try:
        file_path = os.path.join(CAMPAIGNS_DIR, f"{campaign['id']}_campaign.json")
        with open(file_path, 'w') as f:
            json.dump(campaign, f, indent=2)
        logger.info(f"Campaign saved: {campaign['id']}")
    except Exception as e:
        logger.error(f"Failed to save campaign: {str(e)}")

def save_report(report):
    """Save report to file"""
    try:
        file_path = os.path.join(REPORTS_DIR, f"{report['id']}_report.json")
        with open(file_path, 'w') as f:
            json.dump(report, f, indent=2)
        logger.info(f"Report saved: {report['id']}")
    except Exception as e:
        logger.error(f"Failed to save report: {str(e)}")

def load_campaign(campaign_id):
    """Load campaign from file"""
    try:
        file_path = os.path.join(CAMPAIGNS_DIR, f"{campaign_id}_campaign.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load campaign: {str(e)}")
        return None

def load_all_campaigns():
    """Load all campaigns from file"""
    campaigns = []
    try:
        for filename in os.listdir(CAMPAIGNS_DIR):
            if filename.endswith('_campaign.json'):
                file_path = os.path.join(CAMPAIGNS_DIR, filename)
                with open(file_path, 'r') as f:
                    campaigns.append(json.load(f))
    except Exception as e:
        logger.error(f"Failed to load campaigns: {str(e)}")
    return campaigns

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)