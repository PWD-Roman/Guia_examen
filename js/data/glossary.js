/* Term encyclopedia. `def` supports SH.md mini-markdown. */
window.SH.glossary = [
  // Programming
  { id: 'g-closure', term: 'Closure', topic: 'prog', def: 'A function together with the lexical environment it was created in, so it can still use outer variables after the outer function returns.', code: `function counter() {
  let n = 0;
  return () => ++n;
}
const next = counter();
next(); next(); // 2`, lang: 'js' },
  { id: 'g-hoisting', term: 'Hoisting', topic: 'prog', def: 'JS moves declarations to the top of their scope. `var` is hoisted and initialized to `undefined`. `let` and `const` are hoisted but sit in the **Temporal Dead Zone** until their declaration runs. Function declarations are fully hoisted.' },
  { id: 'g-gc', term: 'Garbage Collection', topic: 'prog', def: 'Automatic reclamation of memory that is no longer reachable. Common strategies: reference counting (CPython, plus a cycle detector), tracing mark-and-sweep, and generational collectors (JVM, V8).' },
  { id: 'g-recursion', term: 'Recursion & Base Case', topic: 'prog', def: 'A function that calls itself on a smaller input. It needs a **base case** to stop; otherwise the stack overflows. Tail recursion can be optimized in some languages (not in CPython or Java).' },
  { id: 'g-generics', term: 'Generics / Templates', topic: 'prog', def: 'Code parameterized by type, e.g. `List<T>` (Java), `Array<T>` (TS) or `template<typename T>` (C++). Java uses type erasure; C++ templates generate code per type (monomorphization).' },
  { id: 'g-async', term: 'async / await', topic: 'prog', def: 'Syntax over Promises (JS) or coroutines (Python asyncio) for writing non-blocking code that reads sequentially. `await` pauses the async function, not the thread.', code: `async function load() {
  const res = await fetch('/api/user');
  return res.json();
}`, lang: 'js' },
  { id: 'g-pointer', term: 'Pointer vs Reference (C++)', topic: 'prog', def: 'A pointer holds an address, can be null and can be reseated (`int* p = &x;`). A reference is an alias that must be bound at initialization and cannot be reseated (`int& r = x;`).' },
  { id: 'g-compiled', term: 'Compiled vs Interpreted', topic: 'prog', def: 'Compiled languages translate ahead of time to machine code (C, C++, Rust). Interpreted languages execute through an interpreter. Many modern runtimes mix both: bytecode plus a **JIT** (Java, C#, V8 JS, PyPy).' },

  // Logic
  { id: 'g-demorgan', term: "De Morgan's Laws", topic: 'logic', def: "¬(A ∧ B) ≡ ¬A ∨ ¬B and ¬(A ∨ B) ≡ ¬A ∧ ¬B. Used to push negations inward and to convert between NAND and NOR implementations." },
  { id: 'g-minterm', term: 'Minterm / Maxterm', topic: 'logic', def: "A **minterm** is a product term containing every variable once that is 1 for exactly one input row (e.g. A'BC for 011 = m3). A **maxterm** is a sum term that is 0 for exactly one row." },
  { id: 'g-kmap', term: 'Karnaugh Map', topic: 'logic', def: 'A grid representation of a truth table ordered in Gray code, so adjacent cells differ by one bit. Grouping 1s in rectangles of power-of-2 sizes gives a minimal SOP expression.' },
  { id: 'g-tautology', term: 'Tautology / Contradiction / Contingency', topic: 'logic', def: 'A tautology is always true (p ∨ ¬p), a contradiction is always false (p ∧ ¬p), and a contingency depends on its inputs. The Boolean Solver classifies expressions automatically.' },
  { id: 'g-qm', term: 'Quine–McCluskey Method', topic: 'logic', def: 'A tabular, algorithmic alternative to K-maps. It repeatedly merges implicants that differ in one bit to find the prime implicants, then selects a minimal cover (essential prime implicants first).' },
  { id: 'g-functional-complete', term: 'Functional Completeness', topic: 'logic', def: 'A set of operators is functionally complete if it can express every Boolean function, e.g. {AND, OR, NOT}, {NAND} or {NOR}.' },

  // Web
  { id: 'g-http', term: 'HTTP', topic: 'web', def: 'HyperText Transfer Protocol: a stateless request/response application protocol. A request has a method, path, headers and an optional body; a response has a status code, headers and a body. HTTPS is HTTP over TLS (port 443).' },
  { id: 'g-rest', term: 'REST', topic: 'web', def: 'Representational State Transfer. Resources are identified by URLs and manipulated through a uniform interface (HTTP methods), with stateless interactions and cacheable responses.', code: `GET    /users/42      -> read
POST   /users         -> create
PUT    /users/42      -> replace
PATCH  /users/42      -> partial update
DELETE /users/42      -> remove`, lang: 'text' },
  { id: 'g-websocket', term: 'WebSocket', topic: 'web', def: 'A full-duplex, persistent connection over a single TCP socket that starts with an HTTP Upgrade handshake (101 Switching Protocols). Ideal for chat, live dashboards and multiplayer games.' },
  { id: 'g-dns', term: 'DNS', topic: 'web', def: 'The Domain Name System maps names to records (A, AAAA, CNAME, MX, TXT, NS). Resolution goes recursive resolver → root → TLD → authoritative server, with caching controlled by TTL.' },
  { id: 'g-tls', term: 'TLS', topic: 'web', def: 'Transport Layer Security provides confidentiality, integrity and server authentication. TLS 1.3 completes its handshake in one round trip (1-RTT) and uses ECDHE for forward secrecy.' },
  { id: 'g-cors', term: 'CORS', topic: 'web', def: 'Cross-Origin Resource Sharing: a browser mechanism that lets a server opt in to cross-origin requests through headers such as `Access-Control-Allow-Origin`. Non-simple requests trigger an OPTIONS **preflight**.' },
  { id: 'g-cdn', term: 'CDN', topic: 'web', def: 'A Content Delivery Network: geographically distributed edge caches that serve content from close to users, reducing latency and origin load.' },
  { id: 'g-graphql', term: 'GraphQL', topic: 'web', def: 'A query language for APIs where clients request exactly the fields they need from a single endpoint. It avoids REST over- and under-fetching but complicates caching and rate limiting.' },
  { id: 'g-osi', term: 'OSI Model', topic: 'web', def: 'A 7-layer conceptual model: Physical, Data Link, Network, Transport, Session, Presentation, Application. The practical TCP/IP model has 4 layers: Link, Internet, Transport, Application.' },

  // Databases
  { id: 'g-normalization', term: 'Normalization', topic: 'db', def: 'Organizing tables to reduce redundancy and update, insert and delete anomalies (1NF → 2NF → 3NF → BCNF). **Denormalization** reintroduces controlled redundancy for read performance.' },
  { id: 'g-index', term: 'Index', topic: 'db', def: 'An auxiliary data structure (usually a B+tree) that speeds up lookups at the cost of extra storage and slower writes. Composite indexes follow the **leftmost-prefix** rule.', code: `CREATE INDEX idx_orders_cust_date
  ON orders (customer_id, created_at);`, lang: 'sql' },
  { id: 'g-acid', term: 'ACID', topic: 'db', def: 'Atomicity, Consistency, Isolation, Durability: the guarantees of reliable transactions.' },
  { id: 'g-join', term: 'JOIN types', topic: 'db', def: 'INNER (only matches), LEFT/RIGHT OUTER (all rows of one side plus matches), FULL OUTER (all rows of both), CROSS (Cartesian product), SELF (a table joined with itself).', code: `SELECT c.name, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;`, lang: 'sql' },
  { id: 'g-cap', term: 'CAP Theorem', topic: 'db', def: 'In the presence of a network Partition, a distributed system must choose Consistency or Availability. Real systems are tuned along this spectrum (e.g. quorum reads and writes).' },
  { id: 'g-sharding', term: 'Sharding vs Replication', topic: 'db', def: '**Sharding** splits data horizontally across nodes by a shard key, which scales writes and storage. **Replication** copies the same data to several nodes, which scales reads and adds availability.' },
  { id: 'g-orm', term: 'ORM & N+1 Problem', topic: 'db', def: 'An Object-Relational Mapper maps tables to objects. The **N+1 problem** is one query for a list plus one query per item. Fix it with eager loading or JOINs.' },
  { id: 'g-explain', term: 'EXPLAIN / Query Plan', topic: 'db', def: 'Shows how the database will execute a query: sequential vs index scans, join algorithms, estimated rows. `EXPLAIN ANALYZE` actually runs the query and reports real timings.' },

  // Algorithms
  { id: 'g-bigo', term: 'Big-O Notation', topic: 'algo', def: 'An asymptotic upper bound on growth rate. Big-Ω is a lower bound and Big-Θ a tight bound. Constants and lower-order terms are dropped: 3n² + 5n → O(n²).' },
  { id: 'g-amortized', term: 'Amortized Analysis', topic: 'algo', def: 'The average cost per operation over a worst-case sequence. Appending to a dynamic array is amortized O(1), even though an occasional resize costs O(n).' },
  { id: 'g-heap', term: 'Heap / Priority Queue', topic: 'algo', def: 'A complete binary tree satisfying the heap property, stored in an array. Supports O(log n) insert and extract and O(1) peek. Used in Dijkstra, scheduling and top-k problems.' },
  { id: 'g-bst', term: 'Binary Search Tree', topic: 'algo', def: 'For each node, keys on the left are smaller and keys on the right are larger. Operations are O(h), and h can degrade to n. Self-balancing variants (AVL, Red-Black) guarantee O(log n).' },
  { id: 'g-dp', term: 'Dynamic Programming', topic: 'algo', def: 'Solving problems by combining cached solutions of overlapping subproblems. Classics: Fibonacci, knapsack, LCS, edit distance, coin change, longest increasing subsequence.' },
  { id: 'g-greedy', term: 'Greedy Algorithm', topic: 'algo', def: 'Takes the locally optimal choice at each step. It is correct only when the problem has the greedy-choice property (activity selection, Huffman coding, Dijkstra, Kruskal/Prim MST).' },
  { id: 'g-two-pointers', term: 'Two Pointers / Sliding Window', topic: 'algo', def: 'Patterns that turn O(n²) scans into O(n): two indices moving toward each other on sorted data, or a window that expands and shrinks over a sequence (longest substring without repeats).' },
  { id: 'g-topo', term: 'Topological Sort', topic: 'algo', def: 'A linear ordering of a DAG\'s vertices such that every edge u→v has u before v. Computed with Kahn\'s algorithm (BFS on in-degrees) or with DFS post-order. Used for build systems and course prerequisites.' },

  // Security
  { id: 'g-sqli', term: 'SQL Injection', topic: 'sec', def: 'Untrusted input concatenated into SQL changes the query\'s meaning. Prevent it with parameterized queries.', code: `# Vulnerable
cur.execute("SELECT * FROM users WHERE name = '" + name + "'")
# Safe
cur.execute("SELECT * FROM users WHERE name = %s", (name,))`, lang: 'python' },
  { id: 'g-xss', term: 'XSS (Cross-Site Scripting)', topic: 'sec', def: 'Injection of a malicious script into pages viewed by other users. Types: stored, reflected and DOM-based. Defenses: output encoding, `textContent` instead of `innerHTML`, CSP, sanitizers (DOMPurify).' },
  { id: 'g-csrf', term: 'CSRF', topic: 'sec', def: 'Cross-Site Request Forgery: a malicious site makes the victim\'s browser send an authenticated request. Defenses: anti-CSRF tokens, SameSite cookies, re-authentication for sensitive actions.' },
  { id: 'g-jwt', term: 'JWT', topic: 'sec', def: 'A JSON Web Token: `header.payload.signature`, Base64URL-encoded. A signed (not encrypted) token carrying claims such as `sub`, `exp` and `aud`. Always verify the signature and expiry server-side.' },
  { id: 'g-oauth', term: 'OAuth 2.0 / OIDC', topic: 'sec', def: 'OAuth 2.0 delegates authorization (access tokens with scopes). OpenID Connect adds authentication (the ID token). Recommended flow: Authorization Code + PKCE.' },
  { id: 'g-rbac', term: 'RBAC vs ABAC', topic: 'sec', def: 'Role-Based Access Control grants permissions through roles (admin, editor). Attribute-Based Access Control evaluates policies over user, resource and environment attributes.' },
  { id: 'g-least-priv', term: 'Principle of Least Privilege', topic: 'sec', def: 'Give each user, process and service only the minimum permissions it needs, for the minimum time. This limits the blast radius of a compromise.' },
  { id: 'g-iso25010', term: 'ISO/IEC 25010', topic: 'sec', def: 'The SQuaRE product quality model. 2023 edition characteristics: Functional suitability, Performance efficiency, Compatibility, Interaction capability, Reliability, Security, Maintainability, Flexibility, Safety.' },
  { id: 'g-cicd', term: 'CI/CD', topic: 'sec', def: 'Continuous Integration (frequent merges, automated build and test) plus Continuous Delivery/Deployment (automated release pipeline). Typical stages: lint → test → build → security scan (SAST, dependencies) → deploy to staging → production.' },
  { id: 'g-sast', term: 'SAST / DAST / SCA', topic: 'sec', def: 'SAST: static analysis of source code. DAST: testing the running application from outside. SCA: Software Composition Analysis, which finds vulnerable dependencies.' },

  // AI
  { id: 'g-supervised', term: 'Supervised Learning', topic: 'ai', def: 'Learning a mapping from inputs to **labeled** outputs. Tasks: classification (discrete classes) and regression (continuous values).' },
  { id: 'g-unsupervised', term: 'Unsupervised Learning', topic: 'ai', def: 'Finding structure in **unlabeled** data: clustering (k-means, DBSCAN), dimensionality reduction (PCA, t-SNE, UMAP), anomaly detection.' },
  { id: 'g-overfitting', term: 'Overfitting', topic: 'ai', def: 'The model learns noise in the training data and generalizes poorly. Spotted by a large gap between training and validation performance.' },
  { id: 'g-gradient-descent', term: 'Gradient Descent', topic: 'ai', def: 'An iterative optimization that moves parameters against the gradient of the loss: θ ← θ − η∇L(θ). The learning rate η controls step size: too large diverges, too small is slow.' },
  { id: 'g-confusion', term: 'Confusion Matrix', topic: 'ai', def: 'A table of TP, FP, FN and TN counts for a classifier, from which accuracy, precision, recall, specificity and F1 are derived.' },
  { id: 'g-nn', term: 'Neural Network', topic: 'ai', def: 'Layers of weighted sums followed by non-linear activations. Trained by backpropagation plus gradient descent. Variants: MLP, CNN (images), RNN/LSTM (sequences), Transformer (attention).' },
  { id: 'g-feature-eng', term: 'Feature Engineering', topic: 'ai', def: 'Creating and transforming input variables: scaling, one-hot encoding, binning, log transforms, interaction features, handling missing values.' },

  // Architecture
  { id: 'g-solid', term: 'SOLID', topic: 'arch', def: 'Five OO design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.' },
  { id: 'g-di', term: 'Dependency Injection', topic: 'arch', def: 'Supplying an object\'s dependencies from outside (constructor, setter or container) instead of constructing them inside. It enables loose coupling and testability.', code: `class OrderService {
  constructor(private payments: PaymentGateway) {}
  checkout(o: Order) { return this.payments.charge(o.total); }
}`, lang: 'ts' },
  { id: 'g-observer', term: 'Observer Pattern', topic: 'arch', def: 'A subject maintains a list of observers and notifies them of state changes. It is the basis of event systems and reactive programming.' },
  { id: 'g-strategy', term: 'Strategy Pattern', topic: 'arch', def: 'Defines a family of interchangeable algorithms behind one interface; the client picks one at runtime.' },
  { id: 'g-factory', term: 'Factory Method', topic: 'arch', def: 'A creational pattern that defers object instantiation to a method or subclass, so client code depends on an interface instead of concrete classes.' },
  { id: 'g-decorator', term: 'Decorator Pattern', topic: 'arch', def: 'Wraps an object to add behavior dynamically while keeping the same interface, e.g. Java I/O streams or middleware chains.' },
  { id: 'g-microservices', term: 'Microservices', topic: 'arch', def: 'Small, independently deployable services, each owning its data and communicating over the network (HTTP, gRPC, messaging). Needs service discovery, an API gateway, observability and resilience patterns.' },
  { id: 'g-circuit', term: 'Circuit Breaker', topic: 'arch', def: 'A resilience pattern that stops calling a failing dependency once failures pass a threshold (Closed → Open → Half-Open), preventing cascading failures.' },
  { id: 'g-hexagonal', term: 'Hexagonal / Clean Architecture', topic: 'arch', def: 'The domain logic sits at the center and depends on nothing external. Adapters (DB, web, messaging) plug in through ports, and dependencies point inward.' },
  { id: 'g-cqrs', term: 'CQRS & Event Sourcing', topic: 'arch', def: 'CQRS separates the command (write) model from the query (read) model. Event Sourcing stores state as an append-only log of events, and current state is a projection of it.' },
  { id: 'g-uml', term: 'UML Diagrams', topic: 'arch', def: 'Structural: class, component, deployment. Behavioral: use case, sequence, activity, state machine. In class diagrams, a filled diamond is composition, a hollow diamond is aggregation, and a hollow triangle is inheritance.' },
];
