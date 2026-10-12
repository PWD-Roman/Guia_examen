/* Curriculum map. `subs` are the subtopics the advisor reports on. */
window.SH.topics = [
  {
    id: 'prog', name: 'Programming Fundamentals & Syntax', short: 'Programming', icon: '{ }', color: '#5b9dff',
    desc: 'Types, scope, memory, references vs. values and idioms across Python, JS/TS, Java and C++.',
    subs: ['Python', 'JavaScript/TypeScript', 'Java', 'C++', 'Types & Memory'],
  },
  {
    id: 'logic', name: 'Logic, Boolean Algebra & Truth Tables', short: 'Logic', icon: '∧∨', color: '#9b7bff',
    desc: 'Propositional logic, Boolean laws, De Morgan, canonical forms, K-maps and logic gates.',
    subs: ['Boolean Laws', 'Truth Tables', 'Canonical Forms', 'Logic Gates', 'Propositional Logic'],
  },
  {
    id: 'web', name: 'Web Development & Protocols', short: 'Web & Protocols', icon: '</>', color: '#2fc4c4',
    desc: 'HTTP/S, REST, WebSockets, DNS, TLS, the OSI and TCP/IP models and browser fundamentals.',
    subs: ['HTTP', 'REST', 'WebSockets', 'DNS', 'OSI & TCP/IP', 'TLS'],
  },
  {
    id: 'db', name: 'Databases & Data Modeling', short: 'Databases', icon: 'DB', color: '#f5a742',
    desc: 'SQL, joins, normalization, indexing, transactions, ACID, isolation levels, NoSQL and CAP.',
    subs: ['SQL', 'Normalization', 'Indexing', 'Transactions & ACID', 'NoSQL & CAP'],
  },
  {
    id: 'algo', name: 'Algorithms & Data Structures', short: 'Algorithms', icon: 'O(n)', color: '#3ccf91',
    desc: 'Big-O, sorting, searching, trees, graphs, hashing and dynamic programming.',
    subs: ['Big-O', 'Sorting', 'Searching', 'Data Structures', 'Graphs', 'Dynamic Programming'],
  },
  {
    id: 'sec', name: 'Cybersecurity & Quality Standards', short: 'Security & Quality', icon: '⛨', color: '#ff6b8a',
    desc: 'OWASP Top 10, authentication and authorization, cryptography, CI/CD, testing and ISO/IEC 25010.',
    subs: ['OWASP', 'Auth', 'Cryptography', 'CI/CD & Testing', 'ISO/IEC 25010'],
  },
  {
    id: 'ai', name: 'AI, Machine Learning & Data Science', short: 'AI & ML', icon: 'ML', color: '#e58cff',
    desc: 'Supervised vs. unsupervised learning, evaluation metrics, overfitting, neural networks and data prep.',
    subs: ['ML Paradigms', 'Metrics', 'Overfitting & Bias', 'Neural Networks', 'Data Science'],
  },
  {
    id: 'arch', name: 'Software Design & Architecture', short: 'Design & Architecture', icon: '◇', color: '#c3d350',
    desc: 'OOP, SOLID, GoF design patterns, architectural styles, microservices and system design.',
    subs: ['OOP', 'SOLID', 'Design Patterns', 'Architecture Styles', 'Microservices', 'SDLC & Process'],
  },
];
