// Book Writer Agent - Main Export File

const BookWriterAgent = require('./BookWriterAgent');

// Export all individual components for modular use
const ContentPlanner = require('./core/ContentPlanner');
const ResearchManager = require('./core/ResearchManager');
const InterviewConductor = require('./core/InterviewConductor');
const MarketAnalyzer = require('./core/MarketAnalyzer');
const PublishingCoordinator = require('./core/PublishingCoordinator');

const ChapterWriter = require('./content/ChapterWriter');
const RevisionManager = require('./content/RevisionManager');

const ImageGenerator = require('./media/ImageGenerator');
const GraphicsCoordinator = require('./media/GraphicsCoordinator');
const VisualContentPlanner = require('./media/VisualContentPlanner');

const PublisherDatabase = require('./publishing/PublisherDatabase');
const DealNegotiator = require('./publishing/DealNegotiator');
const ContractManager = require('./publishing/ContractManager');

const ScraperInterface = require('./utils/ScraperInterface');
const DocumentFormatter = require('./utils/DocumentFormatter');
const CommunicationManager = require('./utils/CommunicationManager');

// Export the main agent
module.exports = BookWriterAgent;

// Export individual components
module.exports.ContentPlanner = ContentPlanner;
module.exports.ResearchManager = ResearchManager;
module.exports.InterviewConductor = InterviewConductor;
module.exports.MarketAnalyzer = MarketAnalyzer;
module.exports.PublishingCoordinator = PublishingCoordinator;

module.exports.ChapterWriter = ChapterWriter;
module.exports.RevisionManager = RevisionManager;

module.exports.ImageGenerator = ImageGenerator;
module.exports.GraphicsCoordinator = GraphicsCoordinator;
module.exports.VisualContentPlanner = VisualContentPlanner;

module.exports.PublisherDatabase = PublisherDatabase;
module.exports.DealNegotiator = DealNegotiator;
module.exports.ContractManager = ContractManager;

module.exports.ScraperInterface = ScraperInterface;
module.exports.DocumentFormatter = DocumentFormatter;
module.exports.CommunicationManager = CommunicationManager;