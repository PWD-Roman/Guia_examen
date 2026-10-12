/* Cheat sheets: quick-reference pages rendered as HTML. Cells support SH.md. */
(function () {
  const SH = window.SH;
  const table = (head, rows) =>
    `<div class="table-scroll"><table class="ref"><thead><tr>${head.map((h) => `<th>${SH.esc(h)}</th>`).join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c) => `<td>${SH.md(String(c))}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  const code = SH.codeBlock;
  const h = (t) => `<h3>${SH.esc(t)}</h3>`;
  const p = (t) => `<p class="muted small">${SH.md(t)}</p>`;

  SH.cheatsheets = [
    {
      id: 'cs-bigo', title: 'Big-O & Data Structures', topic: 'algo',
      html:
        h('Common complexities') +
        table(['Notation', 'Name', 'Example'], [
          ['O(1)', 'Constant', 'Hash lookup, array index'],
          ['O(log n)', 'Logarithmic', 'Binary search, balanced BST op'],
          ['O(n)', 'Linear', 'Linear scan, BFS/DFS (V+E)'],
          ['O(n log n)', 'Linearithmic', 'Merge sort, heap sort, efficient sorts'],
          ['O(n²)', 'Quadratic', 'Nested loops, bubble/insertion sort'],
          ['O(2ⁿ)', 'Exponential', 'Naive recursive Fibonacci, all subsets'],
          ['O(n!)', 'Factorial', 'All permutations, brute-force TSP'],
        ]) +
        h('Data structure operations (average / worst)') +
        table(['Structure', 'Access', 'Search', 'Insert', 'Delete'], [
          ['Array', 'O(1)', 'O(n)', 'O(n)', 'O(n)'],
          ['Dynamic array (append)', 'O(1)', 'O(n)', 'O(1) amortized', 'O(n)'],
          ['Linked list', 'O(n)', 'O(n)', 'O(1) at known node', 'O(1) at known node'],
          ['Stack / Queue', '—', 'O(n)', 'O(1)', 'O(1)'],
          ['Hash table', '—', 'O(1) / O(n)', 'O(1) / O(n)', 'O(1) / O(n)'],
          ['BST (unbalanced)', '—', 'O(log n) / O(n)', 'O(log n) / O(n)', 'O(log n) / O(n)'],
          ['AVL / Red-Black', '—', 'O(log n)', 'O(log n)', 'O(log n)'],
          ['Binary heap', 'O(1) peek', 'O(n)', 'O(log n)', 'O(log n) extract'],
          ['Trie', '—', 'O(L)', 'O(L)', 'O(L)'],
        ]),
    },
    {
      id: 'cs-sorting', title: 'Sorting Algorithms', topic: 'algo',
      html:
        table(['Algorithm', 'Best', 'Average', 'Worst', 'Space', 'Stable'], [
          ['Bubble sort', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'Yes'],
          ['Selection sort', 'O(n²)', 'O(n²)', 'O(n²)', 'O(1)', 'No'],
          ['Insertion sort', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', 'Yes'],
          ['Merge sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Yes'],
          ['Quicksort', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'No'],
          ['Heapsort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'No'],
          ['Counting sort', 'O(n+k)', 'O(n+k)', 'O(n+k)', 'O(k)', 'Yes'],
          ['Radix sort', 'O(d(n+k))', 'O(d(n+k))', 'O(d(n+k))', 'O(n+k)', 'Yes'],
          ['Timsort (Python, Java objects)', 'O(n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Yes'],
        ]) +
        p('Comparison sorts cannot beat Ω(n log n) in the worst case. Insertion sort is excellent for small or nearly sorted arrays.') +
        h('Binary search template') +
        code(`def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`, 'python'),
    },
    {
      id: 'cs-http', title: 'HTTP Methods & Status Codes', topic: 'web',
      html:
        h('Methods') +
        table(['Method', 'Purpose', 'Safe', 'Idempotent', 'Body'], [
          ['GET', 'Read a resource', 'Yes', 'Yes', 'No'],
          ['HEAD', 'Headers only', 'Yes', 'Yes', 'No'],
          ['POST', 'Create / process', 'No', 'No', 'Yes'],
          ['PUT', 'Replace entirely', 'No', 'Yes', 'Yes'],
          ['PATCH', 'Partial update', 'No', 'Not guaranteed', 'Yes'],
          ['DELETE', 'Remove', 'No', 'Yes', 'Optional'],
          ['OPTIONS', 'Capabilities / CORS preflight', 'Yes', 'Yes', 'No'],
        ]) +
        h('Status codes you must know') +
        table(['Code', 'Meaning', 'When'], [
          ['200 OK', 'Success', 'Standard successful GET/PUT'],
          ['201 Created', 'Resource created', 'POST; include a `Location` header'],
          ['204 No Content', 'Success, no body', 'DELETE, some PUTs'],
          ['301 / 308', 'Moved permanently', 'SEO-safe redirects (308 keeps the method)'],
          ['302 / 307', 'Temporary redirect', '307 keeps the method'],
          ['304 Not Modified', 'Use the cache', 'Conditional GET (ETag / If-None-Match)'],
          ['400 Bad Request', 'Malformed input', 'Validation errors'],
          ['401 Unauthorized', 'Not authenticated', 'Missing or invalid credentials'],
          ['403 Forbidden', 'Not authorized', 'Authenticated, lacks permission'],
          ['404 Not Found', 'No such resource', ''],
          ['409 Conflict', 'State conflict', 'Duplicate, version mismatch'],
          ['422 Unprocessable Content', 'Semantic validation failed', ''],
          ['429 Too Many Requests', 'Rate limited', 'Respect `Retry-After`'],
          ['500 Internal Server Error', 'Generic server failure', ''],
          ['502 Bad Gateway', 'Bad upstream response', 'Proxy / load balancer'],
          ['503 Service Unavailable', 'Overloaded or maintenance', ''],
          ['504 Gateway Timeout', 'Upstream timed out', ''],
        ]),
    },
    {
      id: 'cs-osi', title: 'OSI / TCP-IP & Protocols', topic: 'web',
      html:
        table(['#', 'OSI layer', 'TCP/IP layer', 'Unit (PDU)', 'Protocols / devices'], [
          ['7', 'Application', 'Application', 'Data', 'HTTP, HTTPS, DNS, SMTP, FTP, SSH, WebSocket'],
          ['6', 'Presentation', 'Application', 'Data', 'TLS (often placed here), encoding, compression'],
          ['5', 'Session', 'Application', 'Data', 'Sessions, RPC'],
          ['4', 'Transport', 'Transport', 'Segment / Datagram', 'TCP, UDP, QUIC; ports'],
          ['3', 'Network', 'Internet', 'Packet', 'IP (v4/v6), ICMP; routers'],
          ['2', 'Data Link', 'Link', 'Frame', 'Ethernet, Wi-Fi (802.11), ARP; switches, MAC'],
          ['1', 'Physical', 'Link', 'Bits', 'Cables, fiber, radio; hubs'],
        ]) +
        h('TCP vs UDP') +
        table(['', 'TCP', 'UDP'], [
          ['Connection', 'Connection-oriented (3-way handshake)', 'Connectionless'],
          ['Reliability', 'ACKs, retransmission, ordering', 'Best effort'],
          ['Flow / congestion control', 'Yes', 'No'],
          ['Overhead', 'Higher (20+ byte header)', 'Low (8 byte header)'],
          ['Use cases', 'Web, email, file transfer, SSH', 'DNS, VoIP, video, games, QUIC'],
        ]) +
        h('Well-known ports') +
        table(['Port', 'Service'], [
          ['20/21', 'FTP'], ['22', 'SSH'], ['25', 'SMTP'], ['53', 'DNS'], ['80', 'HTTP'], ['443', 'HTTPS'], ['3306', 'MySQL'], ['5432', 'PostgreSQL'], ['6379', 'Redis'], ['27017', 'MongoDB'],
        ]),
    },
    {
      id: 'cs-sql', title: 'SQL Syntax & Joins', topic: 'db',
      html:
        h('Query skeleton (logical order of evaluation in comments)') +
        code(`SELECT   d.name, COUNT(*) AS headcount     -- 5
FROM     employees e                       -- 1
JOIN     departments d ON d.id = e.dept_id -- 1
WHERE    e.active = TRUE                   -- 2
GROUP BY d.name                            -- 3
HAVING   COUNT(*) > 5                      -- 4
ORDER BY headcount DESC                    -- 6
LIMIT    10;                               -- 7`, 'sql') +
        h('DDL & DML') +
        code(`CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
INSERT INTO users (email) VALUES ('a@b.com');
UPDATE users SET email = 'x@y.com' WHERE id = 1;
DELETE FROM users WHERE id = 1;

BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- or ROLLBACK;`, 'sql') +
        h('Joins') +
        table(['Join', 'Returns'], [
          ['INNER JOIN', 'Only rows with matches in both tables'],
          ['LEFT JOIN', 'All left rows plus matches (NULLs when there is no match)'],
          ['RIGHT JOIN', 'All right rows plus matches'],
          ['FULL OUTER JOIN', 'All rows from both sides'],
          ['CROSS JOIN', 'Cartesian product (n × m)'],
        ]) +
        h('Window functions') +
        code(`SELECT name, dept, salary,
       RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank,
       AVG(salary) OVER (PARTITION BY dept) AS dept_avg
FROM employees;`, 'sql'),
    },
    {
      id: 'cs-dbtheory', title: 'Normalization, ACID, Isolation & CAP', topic: 'db',
      html:
        h('Normal forms') +
        table(['Form', 'Rule', 'Fixes'], [
          ['1NF', 'Atomic values, no repeating groups, a primary key', 'Multi-valued cells'],
          ['2NF', '1NF + no partial dependency on part of a composite key', 'Data that depends on half the key'],
          ['3NF', '2NF + no transitive dependency (non-key → non-key)', 'Update anomalies'],
          ['BCNF', 'Every determinant is a candidate key', 'Remaining 3NF edge cases'],
          ['4NF', 'No non-trivial multivalued dependencies', 'Independent multi-valued facts'],
        ]) +
        h('Isolation levels vs anomalies') +
        table(['Level', 'Dirty read', 'Non-repeatable read', 'Phantom'], [
          ['Read Uncommitted', 'Possible', 'Possible', 'Possible'],
          ['Read Committed', 'Prevented', 'Possible', 'Possible'],
          ['Repeatable Read', 'Prevented', 'Prevented', 'Possible*'],
          ['Serializable', 'Prevented', 'Prevented', 'Prevented'],
        ]) +
        p('*PostgreSQL\'s Repeatable Read (snapshot isolation) also prevents phantoms, but allows write skew.') +
        h('SQL vs NoSQL') +
        table(['Type', 'Examples', 'Best for'], [
          ['Relational', 'PostgreSQL, MySQL, SQL Server', 'Structured data, joins, strong consistency'],
          ['Document', 'MongoDB, Couchbase', 'Flexible JSON aggregates'],
          ['Key-value', 'Redis, DynamoDB', 'Caching, sessions, fast lookups'],
          ['Wide-column', 'Cassandra, HBase', 'Massive write-heavy and time-series workloads'],
          ['Graph', 'Neo4j, Neptune', 'Highly connected data, traversals'],
        ]) +
        p('**CAP**: during a partition, pick Consistency or Availability. **PACELC**: Else, trade Latency vs Consistency.'),
    },
    {
      id: 'cs-boolean', title: 'Boolean Algebra Laws', topic: 'logic',
      html:
        table(['Law', 'AND form', 'OR form'], [
          ['Identity', 'A · 1 = A', 'A + 0 = A'],
          ['Null / Domination', 'A · 0 = 0', 'A + 1 = 1'],
          ['Idempotent', 'A · A = A', 'A + A = A'],
          ['Complement', "A · A' = 0", "A + A' = 1"],
          ['Involution', "(A')' = A", ''],
          ['Commutative', 'AB = BA', 'A + B = B + A'],
          ['Associative', '(AB)C = A(BC)', '(A+B)+C = A+(B+C)'],
          ['Distributive', 'A(B + C) = AB + AC', 'A + BC = (A + B)(A + C)'],
          ['Absorption', 'A(A + B) = A', 'A + AB = A'],
          ['De Morgan', "(AB)' = A' + B'", "(A + B)' = A'B'"],
          ['Consensus', "", "AB + A'C + BC = AB + A'C"],
        ]) +
        h('Operator precedence (highest first)') +
        p('NOT → AND (·) → XOR (⊕) → OR (+) → IMPLIES (→) → IFF (↔). Use parentheses when in doubt.') +
        h('Derived operators') +
        table(['Operator', 'Definition'], [
          ['XOR  A ⊕ B', "A'B + AB'"],
          ['XNOR  A ⊙ B', "AB + A'B' = (A ⊕ B)'"],
          ['NAND  A ↑ B', "(AB)'"],
          ['NOR  A ↓ B', "(A + B)'"],
          ['Implication  A → B', "A' + B"],
          ['Biconditional  A ↔ B', "(A → B)(B → A)"],
        ]),
    },
    {
      id: 'cs-solid', title: 'SOLID & Design Patterns', topic: 'arch',
      html:
        h('SOLID') +
        table(['Principle', 'Meaning', 'Smell when violated'], [
          ['Single Responsibility', 'A class has one reason to change', 'God classes, "Manager" classes doing everything'],
          ['Open/Closed', 'Open for extension, closed for modification', 'Growing switch/if chains on type'],
          ['Liskov Substitution', 'Subtypes must be substitutable for their base type', 'Overrides throwing NotSupported'],
          ['Interface Segregation', 'Many small client-specific interfaces', 'Classes implementing methods as no-ops'],
          ['Dependency Inversion', 'Depend on abstractions, not concretions', '`new ConcreteDb()` inside business logic'],
        ]) +
        h('Key GoF patterns') +
        table(['Pattern', 'Type', 'Intent'], [
          ['Singleton', 'Creational', 'Exactly one instance with global access (use sparingly)'],
          ['Factory Method', 'Creational', 'Let subclasses or methods decide which class to instantiate'],
          ['Builder', 'Creational', 'Construct complex objects step by step'],
          ['Adapter', 'Structural', 'Convert one interface into another'],
          ['Decorator', 'Structural', 'Add responsibilities dynamically by wrapping'],
          ['Facade', 'Structural', 'A simple interface to a complex subsystem'],
          ['Proxy', 'Structural', 'A placeholder controlling access (lazy loading, caching, auth)'],
          ['Composite', 'Structural', 'Treat trees of objects uniformly'],
          ['Observer', 'Behavioral', 'Notify dependents of state changes'],
          ['Strategy', 'Behavioral', 'Swap algorithms at runtime'],
          ['Command', 'Behavioral', 'Encapsulate a request as an object (undo, queues)'],
          ['State', 'Behavioral', 'Change behavior when internal state changes'],
          ['Template Method', 'Behavioral', 'Algorithm skeleton with overridable steps'],
        ]) +
        h('Strategy in TypeScript') +
        code(`interface ShippingStrategy { cost(weightKg: number): number; }
const standard: ShippingStrategy = { cost: w => 5 + w * 1.2 };
const express: ShippingStrategy  = { cost: w => 15 + w * 2 };

class Checkout {
  constructor(private shipping: ShippingStrategy) {}
  total(subtotal: number, w: number) { return subtotal + this.shipping.cost(w); }
}`, 'ts'),
    },
    {
      id: 'cs-owasp', title: 'OWASP Top 10 & Security Basics', topic: 'sec',
      html:
        h('OWASP Top 10') +
        table(['2021 edition', '2025 edition', 'Key mitigation'], [
          ['A01 Broken Access Control', 'A01 Broken Access Control', 'Deny by default; server-side ownership checks'],
          ['A02 Cryptographic Failures', 'A02 Security Misconfiguration', 'Hardened defaults, no debug in prod'],
          ['A03 Injection', 'A03 Software Supply Chain Failures', 'SCA, SBOM, pinned & verified dependencies'],
          ['A04 Insecure Design', 'A04 Cryptographic Failures', 'TLS everywhere, strong algorithms, key management'],
          ['A05 Security Misconfiguration', 'A05 Injection', 'Parameterized queries, output encoding'],
          ['A06 Vulnerable & Outdated Components', 'A06 Insecure Design', 'Threat modeling, secure design patterns'],
          ['A07 Identification & Authentication Failures', 'A07 Authentication Failures', 'MFA, rate limiting, secure sessions'],
          ['A08 Software & Data Integrity Failures', 'A08 Software or Data Integrity Failures', 'Signed artifacts, safe deserialization'],
          ['A09 Security Logging & Monitoring Failures', 'A09 Logging & Alerting Failures', 'Centralized logs, alerting'],
          ['A10 Server-Side Request Forgery', 'A10 Mishandling of Exceptional Conditions', 'Fail securely, handle errors explicitly'],
        ]) +
        p('The 2021 list is still the one most often taught; know both if your exam is recent. The mitigation column matches the 2025 entry in the same row.') +
        h('Crypto quick reference') +
        table(['Need', 'Use'], [
          ['Password storage', 'Argon2id / bcrypt / scrypt (salted, slow)'],
          ['Integrity of a message', 'HMAC-SHA-256'],
          ['Symmetric encryption', 'AES-256-GCM, ChaCha20-Poly1305'],
          ['Asymmetric / signatures', 'RSA-2048+, ECDSA, Ed25519'],
          ['Key exchange', 'ECDHE (forward secrecy)'],
          ['Avoid', 'MD5, SHA-1, DES, ECB mode, homemade crypto'],
        ]),
    },
    {
      id: 'cs-quality', title: 'Quality: ISO/IEC 25010, Testing & CI/CD', topic: 'sec',
      html:
        h('ISO/IEC 25010 product quality model') +
        table(['Characteristic (2023)', '2011 name', 'Sub-characteristics (examples)'], [
          ['Functional suitability', 'same', 'Completeness, correctness, appropriateness'],
          ['Performance efficiency', 'same', 'Time behaviour, resource utilization, capacity'],
          ['Compatibility', 'same', 'Co-existence, interoperability'],
          ['Interaction capability', 'Usability', 'Learnability, operability, user error protection, accessibility'],
          ['Reliability', 'same', 'Faultlessness (maturity), availability, fault tolerance, recoverability'],
          ['Security', 'same', 'Confidentiality, integrity, non-repudiation, accountability, authenticity'],
          ['Maintainability', 'same', 'Modularity, reusability, analysability, modifiability, testability'],
          ['Flexibility', 'Portability', 'Adaptability, installability, replaceability, scalability'],
          ['Safety', '(new)', 'Operational constraint, risk identification, fail safe'],
        ]) +
        h('Testing levels & techniques') +
        table(['Level', 'Scope'], [
          ['Unit', 'Single function or class, dependencies mocked'],
          ['Integration', 'Modules together (DB, APIs)'],
          ['System / E2E', 'The whole application through the UI or API'],
          ['Acceptance (UAT)', 'Validates business requirements with users'],
          ['Regression', 'Re-run tests to make sure changes did not break existing behavior'],
        ]) +
        p('Black-box techniques: equivalence partitioning, boundary value analysis, decision tables, state transitions. White-box: statement, branch and path coverage. TDD cycle: **Red → Green → Refactor**.') +
        h('Typical CI/CD pipeline') +
        code(`# .github/workflows/ci.yml (simplified)
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm audit --audit-level=high
      - run: npm run build`, 'bash'),
    },
    {
      id: 'cs-ml', title: 'ML Metrics & Formulas', topic: 'ai',
      html:
        h('Classification') +
        table(['Metric', 'Formula', 'Meaning'], [
          ['Accuracy', '(TP+TN) / (TP+TN+FP+FN)', 'Overall correctness (misleading if imbalanced)'],
          ['Precision', 'TP / (TP+FP)', 'Of predicted positives, how many are real'],
          ['Recall / Sensitivity', 'TP / (TP+FN)', 'Of real positives, how many we caught'],
          ['Specificity', 'TN / (TN+FP)', 'Of real negatives, how many we cleared'],
          ['F1', '2PR / (P+R)', 'Harmonic mean of precision and recall'],
          ['ROC-AUC', 'Area under the TPR-vs-FPR curve', 'Ranking quality across thresholds'],
        ]) +
        h('Regression') +
        table(['Metric', 'Formula'], [
          ['MAE', 'mean(|y − ŷ|)'],
          ['MSE', 'mean((y − ŷ)²)'],
          ['RMSE', '√MSE'],
          ['R²', '1 − SS_res / SS_tot'],
        ]) +
        h('Core ideas') +
        table(['Concept', 'Summary'], [
          ['Bias–variance', 'High bias = underfit; high variance = overfit'],
          ['Regularization', 'L1 (Lasso, sparse weights), L2 (Ridge, small weights), dropout'],
          ['Gradient descent', 'θ ← θ − η∇L(θ)'],
          ['Sigmoid', 'σ(x) = 1 / (1 + e^(−x))'],
          ['Softmax', 'e^(zᵢ) / Σⱼ e^(zⱼ)'],
          ['Cross-entropy', '−Σ y log ŷ'],
        ]) +
        h('scikit-learn pipeline (prevents leakage)') +
        code(`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

model = make_pipeline(StandardScaler(), LogisticRegression())
scores = cross_val_score(model, X, y, cv=5, scoring="f1")`, 'python'),
    },
    {
      id: 'cs-syntax', title: 'Language Syntax Comparison', topic: 'prog',
      html:
        table(['Concept', 'Python', 'JavaScript / TS', 'Java', 'C++'], [
          ['Variable', '`x = 5`', '`let x = 5` / `const`', '`int x = 5;`', '`int x = 5;` / `auto`'],
          ['Function', '`def f(a):`', '`function f(a) {}` / `(a) => {}`', '`int f(int a) {}`', '`int f(int a) {}`'],
          ['List / array', '`[1, 2]`', '`[1, 2]`', '`List.of(1, 2)`', '`std::vector<int>{1, 2}`'],
          ['Map', '`{"a": 1}`', '`new Map()` / `{a: 1}`', '`new HashMap<>()`', '`std::unordered_map`'],
          ['Null', '`None`', '`null` / `undefined`', '`null`', '`nullptr`'],
          ['String format', '`f"{x}"`', 'template literal', '`String.format`', '`std::format` (C++20)'],
          ['Loop', '`for x in xs:`', '`for (const x of xs)`', '`for (int x : xs)`', '`for (auto& x : xs)`'],
          ['Class', '`class A:`', '`class A {}`', '`class A {}`', '`class A {};`'],
          ['Exceptions', '`try/except`', '`try/catch`', '`try/catch` (checked exceptions)', '`try/catch`'],
          ['Memory', 'GC (refcount + cycles)', 'GC', 'GC', 'Manual / RAII'],
        ]) +
        h('Same function, four languages') +
        code(`def is_palindrome(s: str) -> bool:
    s = "".join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]`, 'python') +
        code(`const isPalindrome = (s: string): boolean => {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t === [...t].reverse().join('');
};`, 'ts') +
        code(`static boolean isPalindrome(String s) {
    String t = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    return new StringBuilder(t).reverse().toString().equals(t);
}`, 'java') +
        code(`bool isPalindrome(const std::string& s) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) {
        if (!isalnum(s[i])) { i++; continue; }
        if (!isalnum(s[j])) { j--; continue; }
        if (tolower(s[i++]) != tolower(s[j--])) return false;
    }
    return true;
}`, 'cpp'),
    },
    {
      id: 'cs-sysdesign', title: 'System Design Framework', topic: 'arch',
      html:
        h('Interview framework (45 min)') +
        table(['Step', 'What to do', 'Time'], [
          ['1. Requirements', 'Functional (features) and non-functional (scale, latency, availability, consistency)', '5 min'],
          ['2. Estimation', 'Users, QPS (reads and writes), storage, bandwidth', '5 min'],
          ['3. API design', 'Endpoints, request/response, pagination', '5 min'],
          ['4. Data model', 'Entities, SQL vs NoSQL, keys, indexes', '5 min'],
          ['5. High-level design', 'Clients → LB → services → cache → DB → queues', '10 min'],
          ['6. Deep dive', 'Bottlenecks, sharding, replication, caching strategy', '10 min'],
          ['7. Trade-offs', 'Failure modes, monitoring, what you would do next', '5 min'],
        ]) +
        h('Numbers worth knowing') +
        table(['Item', 'Value'], [
          ['1 day', '≈ 86,400 s (≈ 10⁵)'],
          ['1M requests/day', '≈ 12 requests/s'],
          ['L1 cache reference', '≈ 1 ns'],
          ['Main memory reference', '≈ 100 ns'],
          ['SSD random read', '≈ 16–100 µs'],
          ['Round trip in the same datacenter', '≈ 0.5 ms'],
          ['Round trip across continents', '≈ 150 ms'],
        ]) +
        h('Building blocks') +
        p('Load balancer (L4/L7) · CDN · cache (Redis, cache-aside / write-through) · message queue (Kafka, RabbitMQ, SQS) · read replicas · sharding (hash / range / consistent hashing) · rate limiter (token bucket) · object storage (S3) · search index (Elasticsearch) · observability (logs, metrics, traces).'),
    },
  ];
})();
