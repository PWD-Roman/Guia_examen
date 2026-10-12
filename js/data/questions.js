/* Question bank.
   type: 'mcq' (multiple choice), 'scenario' (multiple choice framed as a real situation),
         'output' (predict the output — free text, checked against `accept`).
   difficulty: 1 easy · 2 medium · 3 hard
   rationale[i] explains why option i is right/wrong (optional). */
window.SH.questions = [
  /* =================== PROGRAMMING FUNDAMENTALS =================== */
  {
    id: 'prog-01', topic: 'prog', sub: 'Python', type: 'output', difficulty: 2,
    q: 'What does this Python code print?',
    lang: 'python',
    code: `def add(item, bucket=[]):
    bucket.append(item)
    return bucket

add(1)
print(add(2))`,
    accept: ['[1, 2]'], answer: '[1, 2]',
    explain: 'Default argument values are evaluated **once**, when the function is defined. The same list object is reused across calls, so the second call sees `[1]` and appends `2`. Idiom: use `bucket=None` and create the list inside the function.',
  },
  {
    id: 'prog-02', topic: 'prog', sub: 'JavaScript/TypeScript', type: 'output', difficulty: 1,
    q: 'What does this JavaScript code log?',
    lang: 'js',
    code: `console.log(typeof null, typeof NaN);`,
    accept: ['object number'], answer: 'object number',
    explain: '`typeof null` is `"object"` — a historical bug kept for compatibility. `NaN` ("Not a Number") is still of type `number` in IEEE 754.',
  },
  {
    id: 'prog-03', topic: 'prog', sub: 'JavaScript/TypeScript', type: 'output', difficulty: 2,
    q: 'What does this code log (in order)?',
    lang: 'js',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    accept: ['3 3 3', '333'], answer: '3 3 3',
    explain: '`var` is function-scoped, so all three callbacks close over the **same** `i`. They run after the loop finishes, when `i === 3`. Using `let` creates a fresh binding per iteration and prints `0 1 2`.',
  },
  {
    id: 'prog-04', topic: 'prog', sub: 'JavaScript/TypeScript', type: 'output', difficulty: 3,
    q: 'Event loop: what is the order of the logs? (separate with spaces)',
    lang: 'js',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    accept: ['A D C B', 'ADCB'], answer: 'A D C B',
    explain: 'Synchronous code runs first (A, D). Then the **microtask** queue (Promise callbacks: C) is drained before the next **macrotask** (setTimeout: B).',
  },
  {
    id: 'prog-05', topic: 'prog', sub: 'Types & Memory', type: 'mcq', difficulty: 1,
    q: 'Why does `0.1 + 0.2 === 0.3` evaluate to `false` in JavaScript (and in most languages)?',
    options: [
      'JavaScript has a bug in its addition operator',
      '0.1 and 0.2 cannot be represented exactly in binary floating point (IEEE 754)',
      'The === operator compares memory addresses',
      'Numbers are stored as strings internally',
    ],
    answer: 1,
    explain: 'Binary floating point cannot represent most decimal fractions exactly; `0.1 + 0.2` is `0.30000000000000004`. Compare with a tolerance (`Math.abs(a-b) < Number.EPSILON`) or use integer cents / decimal types for money.',
  },
  {
    id: 'prog-06', topic: 'prog', sub: 'Java', type: 'mcq', difficulty: 1,
    q: 'In Java, what is the difference between `==` and `.equals()` when comparing two `String` objects?',
    options: [
      'There is no difference',
      '`==` compares references (same object); `.equals()` compares character content',
      '`==` compares content; `.equals()` compares references',
      '`.equals()` only works for primitive types',
    ],
    answer: 1,
    explain: '`==` checks whether both variables point to the same object. `String.equals()` is overridden to compare the characters. Two equal strings built at runtime are usually different objects.',
  },
  {
    id: 'prog-07', topic: 'prog', sub: 'Java', type: 'output', difficulty: 2,
    q: 'What does this Java snippet print?',
    lang: 'java',
    code: `int x = 5;
int y = x++ + ++x;
System.out.println(y);`,
    accept: ['12'], answer: '12',
    explain: '`x++` yields 5 and then sets x to 6. `++x` increments x to 7 and yields 7. 5 + 7 = **12**.',
  },
  {
    id: 'prog-08', topic: 'prog', sub: 'C++', type: 'output', difficulty: 2,
    q: 'What does this C++ program print?',
    lang: 'cpp',
    code: `#include <iostream>
void inc(int a, int &b) { a++; b++; }

int main() {
    int x = 1, y = 1;
    inc(x, y);
    std::cout << x << " " << y;
}`,
    accept: ['1 2'], answer: '1 2',
    explain: '`a` is passed **by value** (a copy), so `x` is unchanged. `b` is a **reference** to `y`, so incrementing it modifies `y`.',
  },
  {
    id: 'prog-09', topic: 'prog', sub: 'C++', type: 'mcq', difficulty: 2,
    q: 'Which modern C++ practice best prevents memory leaks caused by `new` without a matching `delete`?',
    options: [
      'Calling `free()` at the end of `main`',
      'Using RAII with smart pointers such as `std::unique_ptr` / `std::make_unique`',
      'Declaring all objects as `static`',
      'Using `malloc` instead of `new`',
    ],
    answer: 1,
    explain: 'RAII ties a resource\'s lifetime to an object\'s scope; the smart pointer\'s destructor releases memory automatically, even when exceptions are thrown.',
  },
  {
    id: 'prog-10', topic: 'prog', sub: 'JavaScript/TypeScript', type: 'mcq', difficulty: 2,
    q: 'What happens to TypeScript type annotations at runtime?',
    options: [
      'They are enforced by the JavaScript engine',
      'They are erased during compilation; no runtime type checking happens',
      'They are converted to runtime assertions',
      'They make the code run faster',
    ],
    answer: 1,
    explain: 'TypeScript is a compile-time type system. The emitted JavaScript contains no types, so data from the network still needs runtime validation (e.g. with zod).',
  },
  {
    id: 'prog-11', topic: 'prog', sub: 'Types & Memory', type: 'mcq', difficulty: 1,
    q: 'Which statement about stack vs heap memory is correct?',
    options: [
      'The heap stores function call frames; the stack stores dynamically allocated objects',
      'The stack holds call frames and local variables with automatic lifetime; the heap holds dynamically allocated data',
      'Both are managed identically by the garbage collector',
      'Stack memory is always larger than heap memory',
    ],
    answer: 1,
    explain: 'Stack allocation is LIFO, fast and tied to scope. Heap allocation is flexible but must be freed manually (C/C++) or by a garbage collector (Java, Python, JS).',
  },
  {
    id: 'prog-12', topic: 'prog', sub: 'Python', type: 'scenario', difficulty: 2,
    q: 'A Python script runs `if user_id in banned_ids:` one million times. `banned_ids` is a **list** of 100,000 IDs, and the script takes minutes. What is the best fix?',
    options: [
      'Sort the list before every lookup',
      'Convert `banned_ids` to a `set` once, giving average O(1) membership checks',
      'Use a `for` loop with `break` instead of `in`',
      'Rewrite the loop as a list comprehension',
    ],
    answer: 1,
    rationale: [
      'Sorting costs O(n log n) per lookup, which is even worse.',
      'Correct: hash-based sets turn 10^11 comparisons into roughly 10^6 hash lookups.',
      'Same O(n) linear scan; no asymptotic gain.',
      'Comprehensions do not change the O(n) cost of `in` on a list.',
    ],
    explain: '`x in list` is O(n); `x in set` is O(1) on average. Total cost drops from O(n·m) to O(n + m).',
  },
  {
    id: 'prog-13', topic: 'prog', sub: 'Python', type: 'mcq', difficulty: 1,
    q: 'In Python, what does `a is b` check?',
    options: ['Value equality', 'Object identity (same object in memory)', 'Type equality', 'Whether both are truthy'],
    answer: 1,
    explain: '`is` compares identity (`id(a) == id(b)`); `==` calls `__eq__` for value equality. Use `is` mainly for singletons such as `None`.',
  },
  {
    id: 'prog-14', topic: 'prog', sub: 'JavaScript/TypeScript', type: 'mcq', difficulty: 1,
    q: 'Which expression evaluates to `true` in JavaScript?',
    options: ["0 === ''", "0 == ''", "null === undefined", "NaN === NaN"],
    answer: 1,
    rationale: [
      'Strict equality: number vs string, so false.',
      'Correct: loose equality coerces `\'\'` to 0.',
      'Different types under strict equality (`null == undefined` is true, though).',
      'NaN is never equal to itself; use `Number.isNaN`.',
    ],
    explain: '`==` performs type coercion; `===` does not. Prefer `===` to avoid surprises.',
  },

  /* =================== LOGIC & BOOLEAN ALGEBRA =================== */
  {
    id: 'logic-01', topic: 'logic', sub: 'Boolean Laws', type: 'mcq', difficulty: 1,
    q: "According to De Morgan's law, ¬(A ∧ B) is equivalent to:",
    options: ['¬A ∧ ¬B', '¬A ∨ ¬B', 'A ∨ B', '¬A ⊕ ¬B'],
    answer: 1,
    explain: 'De Morgan: the negation of a conjunction is the disjunction of the negations, ¬(A∧B) = ¬A ∨ ¬B, and dually ¬(A∨B) = ¬A ∧ ¬B. Check it in the Boolean Solver with `!(A & B)` and `!A | !B`.',
  },
  {
    id: 'logic-02', topic: 'logic', sub: 'Boolean Laws', type: 'mcq', difficulty: 1,
    q: 'Simplify A + A·B using Boolean algebra.',
    options: ['A·B', 'A', 'B', 'A + B'],
    answer: 1,
    explain: 'Absorption law: A + AB = A(1 + B) = A·1 = A.',
  },
  {
    id: 'logic-03', topic: 'logic', sub: 'Truth Tables', type: 'mcq', difficulty: 1,
    q: 'How many rows does a complete truth table for a function of 5 variables have?',
    options: ['10', '25', '32', '120'],
    answer: 2,
    explain: 'Each variable doubles the combinations: 2^5 = 32 rows.',
  },
  {
    id: 'logic-04', topic: 'logic', sub: 'Propositional Logic', type: 'mcq', difficulty: 1,
    q: 'The implication p → q is **false** only when:',
    options: ['p is false and q is true', 'p is true and q is false', 'both are false', 'both are true'],
    answer: 1,
    explain: 'p → q ≡ ¬p ∨ q. A promise is broken only when the premise holds and the conclusion does not. A false premise makes the implication (vacuously) true.',
  },
  {
    id: 'logic-05', topic: 'logic', sub: 'Propositional Logic', type: 'mcq', difficulty: 2,
    q: 'Which statement is logically equivalent to "If it rains, the ground is wet" (p → q)?',
    options: ['If the ground is wet, it rained (q → p)', 'If it does not rain, the ground is not wet (¬p → ¬q)', 'If the ground is not wet, it did not rain (¬q → ¬p)', 'It rains and the ground is wet (p ∧ q)'],
    answer: 2,
    rationale: ['That is the converse, which is not equivalent.', 'That is the inverse, which is not equivalent.', 'Correct: the contrapositive is always equivalent.', 'A conjunction is a different statement.'],
    explain: 'An implication is equivalent to its **contrapositive** ¬q → ¬p. The converse and the inverse are equivalent to each other, but not to the original.',
  },
  {
    id: 'logic-06', topic: 'logic', sub: 'Logic Gates', type: 'mcq', difficulty: 1,
    q: 'Why are NAND and NOR called "universal" gates?',
    options: ['They are the fastest gates', 'Any Boolean function can be built using only NAND (or only NOR) gates', 'They work with any voltage', 'They have three inputs'],
    answer: 1,
    explain: 'NOT A = A NAND A; AND and OR follow from combining NANDs. The same holds for NOR. This simplifies chip manufacturing.',
  },
  {
    id: 'logic-07', topic: 'logic', sub: 'Canonical Forms', type: 'mcq', difficulty: 2,
    q: 'F(A, B, C) = Σm(0, 2, 4, 6). What is the minimal SOP expression?',
    options: ["A'", "C'", "B'C'", "A ⊕ C"],
    answer: 1,
    explain: "Minterms 0, 2, 4 and 6 are the even numbers, so they are exactly the rows where the least significant bit C = 0. Therefore F = C'.",
  },
  {
    id: 'logic-08', topic: 'logic', sub: 'Truth Tables', type: 'output', difficulty: 1,
    q: 'Evaluate the expression (answer 0 or 1):',
    lang: 'text',
    code: `(1 XOR 1) OR (NOT 0 AND 0)`,
    accept: ['0'], answer: '0',
    explain: '1 XOR 1 = 0. NOT 0 = 1, and 1 AND 0 = 0. Finally 0 OR 0 = **0**.',
  },
  {
    id: 'logic-09', topic: 'logic', sub: 'Propositional Logic', type: 'output', difficulty: 1,
    q: 'What does this Python expression print?',
    lang: 'python',
    code: `print(True and not False or False)`,
    accept: ['True'], answer: 'True',
    explain: 'Precedence: `not` > `and` > `or`. `not False` → True; `True and True` → True; `True or False` → **True**.',
  },
  {
    id: 'logic-10', topic: 'logic', sub: 'Logic Gates', type: 'scenario', difficulty: 2,
    q: 'An alarm must sound when the system is Armed (A) **and** a Door is open (D), or whenever the Glass-break sensor (G) triggers, armed or not. Which expression models it?',
    options: ['A + D + G', 'A·D + G', 'A·(D + G)', '(A + D)·G'],
    answer: 1,
    rationale: ['This would fire on an open door even when disarmed.', 'Correct.', 'This only fires on glass-break when armed.', 'This requires the glass-break sensor in every case.'],
    explain: 'Translate directly: "(A and D) or G" → A·D + G.',
  },
  {
    id: 'logic-11', topic: 'logic', sub: 'Propositional Logic', type: 'mcq', difficulty: 1,
    q: 'Which of these is a tautology (true for every assignment)?',
    options: ['p ∧ ¬p', 'p ∨ ¬p', 'p → ¬p', 'p ⊕ p'],
    answer: 1,
    explain: 'Law of the excluded middle: p ∨ ¬p is always true. p ∧ ¬p is a contradiction, and p ⊕ p is always 0.',
  },
  {
    id: 'logic-12', topic: 'logic', sub: 'Boolean Laws', type: 'mcq', difficulty: 2,
    q: "Simplify A'B' + A'B + AB'.",
    options: ["A + B", "A' + B'", "A'B'", "A ⊕ B"],
    answer: 1,
    explain: "A'B' + A'B = A'. Then A' + AB' = A' + B' (by the absorption-like rule X' + XY = X' + Y). This equals (AB)', so the function is NAND.",
  },
  {
    id: 'logic-13', topic: 'logic', sub: 'Truth Tables', type: 'mcq', difficulty: 1,
    q: 'A ⊕ B (XOR) is 1 when:',
    options: ['both inputs are 1', 'exactly one input is 1', 'both inputs are 0', 'at least one input is 1'],
    answer: 1,
    explain: 'XOR means "different". It is used in adders (the sum bit), parity checks and simple ciphers. Note that A ⊕ A = 0 and A ⊕ 0 = A.',
  },

  /* =================== WEB & PROTOCOLS =================== */
  {
    id: 'web-01', topic: 'web', sub: 'HTTP', type: 'mcq', difficulty: 1,
    q: 'Which HTTP method is **not** idempotent?',
    options: ['GET', 'PUT', 'DELETE', 'POST'],
    answer: 3,
    explain: 'Idempotent means repeating the request leaves the server in the same state. PUT replaces a resource and DELETE removes it, so repeats change nothing further. POST typically creates a new resource each time.',
  },
  {
    id: 'web-02', topic: 'web', sub: 'HTTP', type: 'mcq', difficulty: 1,
    q: 'What is the difference between HTTP 401 and 403?',
    options: [
      '401 = server error, 403 = client error',
      '401 = not authenticated (missing/invalid credentials); 403 = authenticated but not allowed',
      '401 = resource not found; 403 = moved permanently',
      'They are synonyms',
    ],
    answer: 1,
    explain: '401 "Unauthorized" really means *unauthenticated*: try again with credentials. 403 "Forbidden" means your identity is known, but you lack permission.',
  },
  {
    id: 'web-03', topic: 'web', sub: 'OSI & TCP/IP', type: 'mcq', difficulty: 1,
    q: 'At which OSI layer does a router primarily operate, and which layer does TCP belong to?',
    options: ['Router: L2 Data Link · TCP: L3 Network', 'Router: L3 Network · TCP: L4 Transport', 'Router: L4 Transport · TCP: L7 Application', 'Router: L1 Physical · TCP: L5 Session'],
    answer: 1,
    explain: 'Routers forward packets based on IP addresses (L3). TCP and UDP are transport protocols (L4). Switches work at L2 with MAC addresses.',
  },
  {
    id: 'web-04', topic: 'web', sub: 'DNS', type: 'mcq', difficulty: 1,
    q: 'Which DNS record type maps a hostname to an **IPv6** address?',
    options: ['A', 'AAAA', 'CNAME', 'MX'],
    answer: 1,
    explain: 'A → IPv4, AAAA → IPv6, CNAME → alias to another name, MX → mail server, TXT → arbitrary text (SPF, verification), NS → authoritative name servers.',
  },
  {
    id: 'web-05', topic: 'web', sub: 'WebSockets', type: 'mcq', difficulty: 2,
    q: 'How is a WebSocket connection established?',
    options: [
      'Over a dedicated UDP port 8080',
      'An HTTP/1.1 GET with `Upgrade: websocket`; the server answers `101 Switching Protocols`',
      'Via a DNS SRV lookup',
      'The browser sends a POST request every second',
    ],
    answer: 1,
    explain: 'WebSockets start as an HTTP handshake and then switch to a persistent, full-duplex TCP connection (`ws://` or `wss://`).',
  },
  {
    id: 'web-06', topic: 'web', sub: 'REST', type: 'mcq', difficulty: 1,
    q: 'Which is a core REST architectural constraint?',
    options: ['Statelessness: each request contains all the information needed to process it', 'All endpoints must use POST', 'Responses must be XML', 'The server must keep a session per client'],
    answer: 0,
    explain: "Fielding's REST constraints are client–server, stateless, cacheable, uniform interface, layered system, and (optionally) code on demand. Statelessness makes horizontal scaling easy.",
  },
  {
    id: 'web-07', topic: 'web', sub: 'TLS', type: 'mcq', difficulty: 2,
    q: 'What does the TLS handshake accomplish?',
    options: [
      'Compresses HTTP payloads',
      "Authenticates the server through its certificate and establishes shared symmetric session keys",
      'Resolves the domain name',
      'Encrypts data using only RSA for the whole session',
    ],
    answer: 1,
    explain: 'Asymmetric cryptography (certificates plus ECDHE key exchange) is used to agree on keys. Bulk data is then encrypted with fast symmetric ciphers such as AES-GCM or ChaCha20.',
  },
  {
    id: 'web-08', topic: 'web', sub: 'HTTP', type: 'mcq', difficulty: 2,
    q: 'What key feature does HTTP/2 add over HTTP/1.1, and what transport does HTTP/3 use?',
    options: [
      'HTTP/2: plain-text headers · HTTP/3: TCP',
      'HTTP/2: multiplexed streams over one TCP connection · HTTP/3: QUIC over UDP',
      'HTTP/2: WebSockets only · HTTP/3: SCTP',
      'HTTP/2: removes TLS · HTTP/3: raw IP',
    ],
    answer: 1,
    explain: 'HTTP/2 brings binary framing, multiplexing and HPACK header compression. HTTP/3 runs over QUIC (UDP), which avoids TCP head-of-line blocking and speeds up connection setup.',
  },
  {
    id: 'web-09', topic: 'web', sub: 'WebSockets', type: 'scenario', difficulty: 2,
    q: 'Your chat app polls `GET /messages` every second for each of 50,000 users, and the servers are overloaded with mostly empty responses. What should you do?',
    options: [
      'Poll every 100 ms for lower latency',
      'Switch to WebSockets (or Server-Sent Events) so the server pushes messages over a persistent connection',
      'Increase the HTTP cache TTL to one hour',
      'Move the API to FTP',
    ],
    answer: 1,
    explain: 'Push-based persistent connections remove wasted request/response cycles. WebSockets are bidirectional; SSE is simpler when only the server pushes.',
  },
  {
    id: 'web-10', topic: 'web', sub: 'DNS', type: 'scenario', difficulty: 2,
    q: "You updated a domain's A record to point to a new server, but hours later some users still reach the old one. What is the most likely cause?",
    options: ['The new server is down', 'Resolvers are still caching the old record until its TTL expires', 'HTTP/2 is not enabled', 'The SSL certificate is expired'],
    answer: 1,
    explain: 'DNS answers are cached by resolvers, operating systems and browsers for the record\'s TTL. Lower the TTL **before** a migration.',
  },
  {
    id: 'web-11', topic: 'web', sub: 'HTTP', type: 'mcq', difficulty: 2,
    q: 'Who enforces CORS (Cross-Origin Resource Sharing)?',
    options: ['The server firewall', 'The browser, based on response headers such as `Access-Control-Allow-Origin`', 'DNS servers', 'The database'],
    answer: 1,
    explain: 'CORS is a browser security mechanism that relaxes the Same-Origin Policy. curl or a backend can still call the API freely, so CORS is **not** an authentication mechanism.',
  },
  {
    id: 'web-12', topic: 'web', sub: 'HTTP', type: 'output', difficulty: 1,
    q: 'What does this log? (space separated)',
    lang: 'js',
    code: `const u = new URL('https://api.example.com:8080/v1/users?id=42#top');
console.log(u.hostname, u.port, u.searchParams.get('id'));`,
    accept: ['api.example.com 8080 42'], answer: 'api.example.com 8080 42',
    explain: 'URL anatomy: scheme `https`, host `api.example.com`, port `8080`, path `/v1/users`, query `id=42`, fragment `#top` (the fragment is never sent to the server).',
  },
  {
    id: 'web-13', topic: 'web', sub: 'OSI & TCP/IP', type: 'mcq', difficulty: 1,
    q: 'Why is UDP often preferred over TCP for live video calls?',
    options: ['UDP guarantees ordered delivery', 'UDP has lower latency because it skips retransmission and connection setup; late packets are useless anyway', 'UDP encrypts traffic', 'UDP has larger packets'],
    answer: 1,
    explain: 'TCP is reliable and ordered (handshake, ACKs, retransmissions, congestion control). UDP is connectionless and best-effort, which suits real-time media, DNS queries and games.',
  },
  {
    id: 'web-14', topic: 'web', sub: 'REST', type: 'mcq', difficulty: 1,
    q: 'A successful `POST /users` that creates a user should ideally return:',
    options: ['200 OK', '201 Created with a Location header', '204 No Content', '302 Found'],
    answer: 1,
    explain: '201 signals that a resource was created; `Location: /users/123` points to it. 204 is common for successful DELETEs with no body.',
  },

  /* =================== DATABASES =================== */
  {
    id: 'db-01', topic: 'db', sub: 'Normalization', type: 'mcq', difficulty: 1,
    q: 'A table has a column `phones` with values like "555-1234, 555-9876". Which normal form does it violate?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    answer: 0,
    explain: '1NF requires atomic values with no repeating groups. Move the phone numbers to a separate table: `phones(user_id, phone)`.',
  },
  {
    id: 'db-02', topic: 'db', sub: 'Normalization', type: 'mcq', difficulty: 2,
    q: 'Table `Enrollment(student_id, course_id, student_name, grade)` has primary key (student_id, course_id). Which normal form is violated, and why?',
    options: [
      '1NF: grade is not atomic',
      '2NF: student_name depends on only part of the composite key (student_id)',
      '3NF: grade depends transitively on student_name',
      'None; it is in BCNF',
    ],
    answer: 1,
    explain: '2NF forbids **partial dependencies**: non-key attributes must depend on the whole key. Move `student_name` into `Student(student_id, student_name)`.',
  },
  {
    id: 'db-03', topic: 'db', sub: 'Normalization', type: 'mcq', difficulty: 2,
    q: 'Table `Employee(emp_id, dept_id, dept_name)` with key emp_id. emp_id → dept_id → dept_name. What is the problem?',
    options: ['Partial dependency (2NF)', 'Transitive dependency (3NF violation)', 'Multivalued dependency (4NF)', 'No problem'],
    answer: 1,
    explain: '3NF: no non-key attribute may depend on another non-key attribute. Split it into `Department(dept_id, dept_name)`. Mnemonic: "The key, the whole key, and nothing but the key."',
  },
  {
    id: 'db-04', topic: 'db', sub: 'Transactions & ACID', type: 'mcq', difficulty: 1,
    q: 'In ACID, what does **Isolation** guarantee?',
    options: [
      'Committed data survives crashes',
      'Concurrent transactions do not interfere; the result is as if they ran in some serial order (depending on isolation level)',
      'All operations in a transaction succeed or none do',
      'The database moves from one valid state to another',
    ],
    answer: 1,
    rationale: ['That is Durability.', 'Correct.', 'That is Atomicity.', 'That is Consistency.'],
    explain: 'Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions do not interfere), Durability (committed data persists).',
  },
  {
    id: 'db-05', topic: 'db', sub: 'Indexing', type: 'mcq', difficulty: 2,
    q: 'Why are B-tree indexes the default in most relational databases instead of hash indexes?',
    options: [
      'B-trees use no disk space',
      'B-trees support equality **and** range queries / ORDER BY, because keys are kept sorted',
      'Hash indexes cannot handle equality lookups',
      'B-trees never need rebalancing',
    ],
    answer: 1,
    explain: 'A balanced B+tree gives O(log n) lookups and ordered leaf scans for `BETWEEN`, `<`, `>`, `ORDER BY` and prefix `LIKE "abc%"`. Hash indexes only help with `=`.',
  },
  {
    id: 'db-06', topic: 'db', sub: 'Indexing', type: 'scenario', difficulty: 3,
    q: 'This query on a 50M-row table takes 8 s:\n`SELECT * FROM orders WHERE customer_id = ? AND created_at >= ? ORDER BY created_at;`\nWhich index helps most?',
    options: [
      'Single index on created_at',
      'Composite index (customer_id, created_at)',
      'Composite index (created_at, customer_id)',
      'Hash index on created_at',
    ],
    answer: 1,
    rationale: [
      'It scans all customers\' orders in the date range, so it is not selective enough.',
      'Correct: the equality column comes first, then the range/sort column. The index seeks to one customer and reads rows already ordered by date.',
      'With the range column first, the index cannot narrow down by customer efficiently.',
      'Hash indexes do not support ranges or ordering.',
    ],
    explain: 'Rule of thumb for composite indexes: **equality predicates first, then range/sort columns**. This also eliminates the separate sort step.',
  },
  {
    id: 'db-07', topic: 'db', sub: 'Indexing', type: 'scenario', difficulty: 2,
    q: 'There is an index on `users(email)`, but `WHERE LOWER(email) = ?` still does a full table scan. Why, and what is the fix?',
    options: [
      'The index is corrupt; rebuild it',
      'Applying a function to the column prevents using the plain index; create an expression index on LOWER(email) or store emails normalized',
      'Emails cannot be indexed',
      'Add LIMIT 1',
    ],
    answer: 1,
    explain: 'The index stores raw `email` values, not `LOWER(email)`. A predicate that wraps the column in a function is not "sargable". Use an expression index (`CREATE INDEX ON users (LOWER(email))`) or a case-insensitive collation or type (`citext`).',
  },
  {
    id: 'db-08', topic: 'db', sub: 'SQL', type: 'output', difficulty: 2,
    q: '`employees` has 5 rows; 2 of them have `dept = NULL`. What does this return? (two numbers, space separated)',
    lang: 'sql',
    code: `SELECT COUNT(*), COUNT(dept) FROM employees;`,
    accept: ['5 3'], answer: '5 3',
    explain: '`COUNT(*)` counts rows. `COUNT(column)` counts only **non-NULL** values in that column.',
  },
  {
    id: 'db-09', topic: 'db', sub: 'SQL', type: 'mcq', difficulty: 1,
    q: 'What does `customers LEFT JOIN orders ON ...` return?',
    options: [
      'Only customers who have orders',
      'All customers; order columns are NULL for customers without orders',
      'All orders, even those without customers',
      'The Cartesian product of both tables',
    ],
    answer: 1,
    explain: 'A LEFT (outer) JOIN keeps every row from the left table. A common pattern for "customers with no orders" is `LEFT JOIN ... WHERE o.id IS NULL`.',
  },
  {
    id: 'db-10', topic: 'db', sub: 'SQL', type: 'mcq', difficulty: 1,
    q: 'What is the difference between WHERE and HAVING?',
    options: ['No difference', 'WHERE filters rows before grouping; HAVING filters groups after aggregation', 'HAVING is faster', 'WHERE works only with JOINs'],
    answer: 1,
    explain: 'Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Aggregates like `COUNT(*) > 5` belong in HAVING.',
  },
  {
    id: 'db-11', topic: 'db', sub: 'Transactions & ACID', type: 'mcq', difficulty: 3,
    q: 'Which is the weakest SQL-standard isolation level that prevents **dirty reads** but still allows non-repeatable reads?',
    options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
    answer: 1,
    explain: 'READ UNCOMMITTED allows dirty reads. READ COMMITTED prevents them. REPEATABLE READ also prevents non-repeatable reads. SERIALIZABLE also prevents phantoms. Stronger isolation means more locking or aborts.',
  },
  {
    id: 'db-12', topic: 'db', sub: 'NoSQL & CAP', type: 'mcq', difficulty: 2,
    q: 'The CAP theorem says that during a network **partition**, a distributed data store must choose between:',
    options: ['Cost and Performance', 'Consistency and Availability', 'Atomicity and Durability', 'Caching and Persistence'],
    answer: 1,
    explain: 'Partitions will happen, so the real choice is CP (refuse some requests to stay consistent) or AP (answer with possibly stale data). PACELC adds that, Else (with no partition), you trade Latency vs. Consistency.',
  },
  {
    id: 'db-13', topic: 'db', sub: 'NoSQL & CAP', type: 'scenario', difficulty: 2,
    q: 'You need fast "friends of friends who like X" recommendations, traversing many relationships per query. Which store fits best?',
    options: ['Key-value store (Redis)', 'Graph database (Neo4j)', 'Wide-column store (Cassandra)', 'Spreadsheet export'],
    answer: 1,
    explain: 'Graph databases store relationships as first-class edges, so multi-hop traversals avoid expensive recursive JOINs. Document DBs suit flexible aggregates, key-value stores suit caches and sessions, and wide-column stores suit huge write-heavy time series.',
  },
  {
    id: 'db-14', topic: 'db', sub: 'Indexing', type: 'mcq', difficulty: 1,
    q: 'What is the main downside of adding many indexes to a table?',
    options: ['Reads become slower', 'Writes (INSERT/UPDATE/DELETE) become slower and storage grows, because every index must be maintained', 'Indexes delete data', 'Queries return wrong results'],
    answer: 1,
    explain: 'Indexes trade write cost and space for read speed. Index the columns that real queries filter, join or sort on.',
  },

  /* =================== ALGORITHMS & DATA STRUCTURES =================== */
  {
    id: 'algo-01', topic: 'algo', sub: 'Searching', type: 'mcq', difficulty: 1,
    q: 'Binary search has which time complexity, and what does it require?',
    options: ['O(n), unsorted data', 'O(log n), sorted data with random access', 'O(1), a hash function', 'O(n log n), a linked list'],
    answer: 1,
    explain: 'Each step halves the search space. It needs O(1) random access (arrays); on a linked list, reaching the middle costs O(n). Try it in the Algorithm Simulator.',
  },
  {
    id: 'algo-02', topic: 'algo', sub: 'Sorting', type: 'mcq', difficulty: 2,
    q: 'When does Quicksort degrade to O(n²)?',
    options: ['When the data is random', 'When pivots are consistently the smallest/largest element (e.g., first-element pivot on sorted input)', 'When n is a power of 2', 'Never'],
    answer: 1,
    explain: 'Unbalanced partitions give recursion depth n. Mitigations include random pivots, median-of-three, and introsort (switching to heapsort).',
  },
  {
    id: 'algo-03', topic: 'algo', sub: 'Sorting', type: 'mcq', difficulty: 2,
    q: 'Which sorting algorithm is stable, guarantees O(n log n) in the worst case, but needs O(n) extra space?',
    options: ['Quicksort', 'Heapsort', 'Merge sort', 'Selection sort'],
    answer: 2,
    explain: 'Merge sort is stable and always O(n log n), using an auxiliary array. Heapsort is O(n log n) in place but not stable. Python\'s Timsort is a merge/insertion hybrid.',
  },
  {
    id: 'algo-04', topic: 'algo', sub: 'Data Structures', type: 'mcq', difficulty: 1,
    q: 'What is the average and worst-case lookup time in a hash table?',
    options: ['O(1) average, O(n) worst', 'O(log n) both', 'O(n) both', 'O(1) both always'],
    answer: 0,
    explain: 'With a good hash function and resizing, lookups average O(1). If many keys collide into one bucket, lookups degrade to O(n). Java 8+ turns long buckets into trees, giving O(log n).',
  },
  {
    id: 'algo-05', topic: 'algo', sub: 'Graphs', type: 'mcq', difficulty: 2,
    q: 'Which algorithm finds the shortest path (by number of edges) in an **unweighted** graph?',
    options: ['DFS', 'BFS', "Prim's", 'Topological sort'],
    answer: 1,
    explain: 'BFS explores in layers, so it reaches each node by a minimum number of edges. For non-negative weights use Dijkstra; for negative weights use Bellman-Ford.',
  },
  {
    id: 'algo-06', topic: 'algo', sub: 'Dynamic Programming', type: 'mcq', difficulty: 2,
    q: 'Which two properties make a problem suitable for dynamic programming?',
    options: ['Greedy choice and sorting', 'Overlapping subproblems and optimal substructure', 'Randomness and recursion', 'Linear time and constant space'],
    answer: 1,
    explain: 'Optimal substructure means an optimal solution is built from optimal sub-solutions. Overlapping subproblems means the same subproblems recur, so caching them (memoization or a bottom-up table) avoids exponential work.',
  },
  {
    id: 'algo-07', topic: 'algo', sub: 'Dynamic Programming', type: 'output', difficulty: 1,
    q: 'What does this print?',
    lang: 'python',
    code: `def f(n):
    if n <= 1:
        return n
    return f(n - 1) + f(n - 2)

print([f(i) for i in range(7)])`,
    accept: ['[0, 1, 1, 2, 3, 5, 8]'], answer: '[0, 1, 1, 2, 3, 5, 8]',
    explain: 'This is the Fibonacci sequence. The naive recursion is O(2ⁿ); memoization (`@lru_cache`) makes it O(n).',
  },
  {
    id: 'algo-08', topic: 'algo', sub: 'Big-O', type: 'mcq', difficulty: 2,
    q: 'What is the time complexity of this code?',
    lang: 'python',
    code: `for i in range(n):
    j = 1
    while j < n:
        j *= 2`,
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    answer: 1,
    explain: 'The outer loop runs n times. The inner loop doubles j, so it runs about log₂ n times. Total: O(n log n).',
  },
  {
    id: 'algo-09', topic: 'algo', sub: 'Data Structures', type: 'mcq', difficulty: 1,
    q: 'Which pairing of data structure and use case is correct?',
    options: ['Queue → checking balanced parentheses', 'Stack → checking balanced parentheses; Queue → BFS', 'Stack → BFS', 'Heap → undo history'],
    answer: 1,
    explain: 'A stack (LIFO) matches the most recent open bracket and drives DFS, undo and call frames. A queue (FIFO) drives BFS, task scheduling and buffering. A heap is a priority queue.',
  },
  {
    id: 'algo-10', topic: 'algo', sub: 'Data Structures', type: 'scenario', difficulty: 3,
    q: 'You must keep the 10 largest values from a stream of 10 million numbers using minimal memory. Best approach?',
    options: [
      'Store everything and sort: O(n log n) time, O(n) memory',
      'Keep a min-heap of size 10; replace the root when a larger value arrives: O(n log k) time, O(k) memory',
      'Keep a max-heap of all values',
      'Use binary search on the stream',
    ],
    answer: 1,
    explain: "The min-heap's root is the smallest of the current top-k, so each new value costs one comparison and at most one O(log k) replacement.",
  },
  {
    id: 'algo-11', topic: 'algo', sub: 'Searching', type: 'scenario', difficulty: 2,
    q: 'Given an **unsorted** array, determine whether any two numbers sum to a target. Which approach is fastest?',
    options: ['Check every pair: O(n²)', 'One pass with a hash set of seen values; check if target − x was seen: O(n)', 'Sort then binary search each: O(n²)', 'Recursion over all subsets'],
    answer: 1,
    explain: 'The hash set trades O(n) memory for linear time. Sorting plus two pointers gives O(n log n) with O(1) extra space.',
  },
  {
    id: 'algo-12', topic: 'algo', sub: 'Data Structures', type: 'output', difficulty: 1,
    q: 'What is logged? (write the array)',
    lang: 'js',
    code: `const s = [];
s.push(1); s.push(2); s.pop();
s.push(3); s.push(4); s.pop();
console.log(s);`,
    accept: ['[1, 3]', '1,3', '1 3'], answer: '[1, 3]',
    explain: 'Trace: [1] → [1,2] → [1] → [1,3] → [1,3,4] → [1,3]. `push` and `pop` work on the end of the array, so it behaves as a stack.',
  },
  {
    id: 'algo-13', topic: 'algo', sub: 'Graphs', type: 'mcq', difficulty: 3,
    q: "Why can't Dijkstra's algorithm be used with negative edge weights?",
    options: [
      'It only works on trees',
      'It finalizes a node once popped from the priority queue, assuming no later path can be shorter — negative edges break that assumption',
      'It requires an adjacency matrix',
      'Negative numbers overflow the heap',
    ],
    answer: 1,
    explain: 'Use Bellman-Ford (O(V·E)), which also detects negative cycles, or Johnson\'s algorithm for all pairs.',
  },
  {
    id: 'algo-14', topic: 'algo', sub: 'Big-O', type: 'mcq', difficulty: 1,
    q: 'Order these from fastest-growing to slowest-growing: O(n!), O(2ⁿ), O(n²), O(n log n)',
    options: ['n! > 2ⁿ > n² > n log n', '2ⁿ > n! > n² > n log n', 'n² > n log n > 2ⁿ > n!', 'n log n > n² > 2ⁿ > n!'],
    answer: 0,
    explain: 'In order of growth: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!).',
  },

  /* =================== SECURITY & QUALITY =================== */
  {
    id: 'sec-01', topic: 'sec', sub: 'OWASP', type: 'mcq', difficulty: 1,
    q: 'What is the most effective defense against SQL injection?',
    options: ['Escaping quotes manually', 'Parameterized queries / prepared statements', 'Hiding error messages', 'Using POST instead of GET'],
    answer: 1,
    explain: 'With parameters, user input is sent separately from the SQL text, so it can never change the query structure. Add least-privilege DB accounts and input validation as defense in depth.',
  },
  {
    id: 'sec-02', topic: 'sec', sub: 'OWASP', type: 'mcq', difficulty: 2,
    q: 'Which combination best mitigates Cross-Site Scripting (XSS)?',
    options: ['HTTPS only', 'Context-aware output encoding, avoiding innerHTML with untrusted data, and a Content-Security-Policy', 'Strong passwords', 'Rate limiting'],
    answer: 1,
    explain: 'XSS happens when untrusted data is executed as script in the victim\'s browser. Encode on output, use safe templating, sanitize HTML when it is needed, and set CSP and HttpOnly cookies.',
  },
  {
    id: 'sec-03', topic: 'sec', sub: 'OWASP', type: 'mcq', difficulty: 2,
    q: 'Which control specifically defends against Cross-Site Request Forgery (CSRF)?',
    options: ['Anti-CSRF tokens and SameSite cookies', 'Password hashing', 'Input length limits', 'Disabling JavaScript'],
    answer: 0,
    explain: 'CSRF tricks a logged-in browser into sending a forged request with its cookies attached. A secret per-session token, or `SameSite=Lax/Strict` cookies, stops the cross-site request from being accepted.',
  },
  {
    id: 'sec-04', topic: 'sec', sub: 'Cryptography', type: 'mcq', difficulty: 1,
    q: 'How should passwords be stored?',
    options: ['Encrypted with AES so they can be recovered', 'Hashed with SHA-256', 'Hashed with a slow, salted algorithm such as Argon2id or bcrypt', 'Base64-encoded'],
    answer: 2,
    rationale: ['Reversible: if the key leaks, every password leaks.', 'Too fast: GPUs can test billions of guesses per second, and there is no work factor.', 'Correct: the salt defeats rainbow tables and the work factor slows brute force.', 'Encoding is not security.'],
    explain: 'Use a password-hashing function (Argon2id, scrypt, bcrypt, PBKDF2) with a unique salt and a tuned cost factor.',
  },
  {
    id: 'sec-05', topic: 'sec', sub: 'Auth', type: 'mcq', difficulty: 1,
    q: 'Authentication vs. authorization:',
    options: ['Same thing', 'Authentication verifies **who** you are; authorization decides **what** you may do', 'Authorization happens first', 'Authentication is only for APIs'],
    answer: 1,
    explain: 'AuthN covers login, MFA and certificates. AuthZ covers roles, permissions, ACLs and policies (RBAC/ABAC).',
  },
  {
    id: 'sec-06', topic: 'sec', sub: 'Auth', type: 'mcq', difficulty: 2,
    q: 'Which statement about a standard signed JWT (JWS) is true?',
    options: ['Its payload is encrypted', 'Its payload is only Base64URL-encoded, so anyone can read it; the signature prevents tampering', 'It can be revoked instantly by default', 'It must be stored in localStorage'],
    answer: 1,
    explain: 'Never put secrets in a JWT payload. Validate the signature, `exp`, `aud` and `iss`, and pin the algorithm (reject `alg: none`). Revocation needs short lifetimes plus refresh tokens or a denylist.',
  },
  {
    id: 'sec-07', topic: 'sec', sub: 'OWASP', type: 'scenario', difficulty: 2,
    q: 'A logged-in user changes the URL from `/api/invoices/1043` to `/api/invoices/1044` and sees another customer\'s invoice. What is this, and what is the fix?',
    options: [
      'XSS; encode the output',
      'Broken Access Control (IDOR); check on the server that the resource belongs to the requesting user on every request',
      'SQL injection; use prepared statements',
      'Nothing; the IDs should just be random UUIDs',
    ],
    answer: 1,
    rationale: ['No script is injected here.', 'Correct: Insecure Direct Object Reference, part of A01 Broken Access Control.', 'The query is well-formed; the problem is missing authorization.', 'UUIDs only make guessing harder (security through obscurity). The ownership check is still required.'],
    explain: 'Authorization must be enforced on the server for each object access, never just by hiding links in the UI.',
  },
  {
    id: 'sec-08', topic: 'sec', sub: 'Cryptography', type: 'mcq', difficulty: 2,
    q: 'Why does TLS use both asymmetric and symmetric cryptography?',
    options: ['For backward compatibility only', 'Asymmetric crypto solves key exchange and authentication; symmetric crypto is much faster for bulk data', 'Symmetric crypto is more secure', 'Asymmetric crypto cannot encrypt'],
    answer: 1,
    explain: 'Hybrid cryptosystem: ECDHE plus certificate signatures establish a shared secret, then AES-GCM or ChaCha20-Poly1305 encrypt the traffic.',
  },
  {
    id: 'sec-09', topic: 'sec', sub: 'CI/CD & Testing', type: 'mcq', difficulty: 1,
    q: 'Continuous Delivery vs. Continuous Deployment:',
    options: [
      'Same thing',
      'Delivery keeps every change releasable but needs a manual approval to ship; Deployment pushes every passing change to production automatically',
      'Deployment requires manual testing',
      'Delivery skips automated tests',
    ],
    answer: 1,
    explain: 'CI = merge often, build and test automatically. CD (Delivery) = always deployable. CD (Deployment) = automatic release to production.',
  },
  {
    id: 'sec-10', topic: 'sec', sub: 'CI/CD & Testing', type: 'mcq', difficulty: 1,
    q: 'According to the testing pyramid, which tests should you have the most of?',
    options: ['End-to-end UI tests', 'Manual exploratory tests', 'Unit tests', 'Load tests'],
    answer: 2,
    explain: 'Unit tests are fast, cheap and precise. You need fewer integration tests and fewer still E2E tests, because those are slow and flaky.',
  },
  {
    id: 'sec-11', topic: 'sec', sub: 'ISO/IEC 25010', type: 'mcq', difficulty: 2,
    q: 'In ISO/IEC 25010, "the degree to which a product can be modified effectively and efficiently without introducing defects" is a sub-characteristic of:',
    options: ['Reliability', 'Maintainability', 'Usability / Interaction capability', 'Functional suitability'],
    answer: 1,
    explain: 'Maintainability includes modularity, reusability, analysability, modifiability and testability. Response time belongs to Performance efficiency; fault tolerance belongs to Reliability.',
  },
  {
    id: 'sec-12', topic: 'sec', sub: 'ISO/IEC 25010', type: 'mcq', difficulty: 2,
    q: 'Your API must answer 95% of requests in under 200 ms. Which ISO/IEC 25010 characteristic does this requirement address?',
    options: ['Compatibility', 'Performance efficiency (time behaviour)', 'Portability / Flexibility', 'Security'],
    answer: 1,
    explain: 'Performance efficiency covers time behaviour, resource utilization and capacity.',
  },
  {
    id: 'sec-13', topic: 'sec', sub: 'Cryptography', type: 'output', difficulty: 1,
    q: 'What does this print?',
    lang: 'python',
    code: `import hashlib
print(len(hashlib.sha256(b"hello").hexdigest()))`,
    accept: ['64'], answer: '64',
    explain: 'SHA-256 produces 256 bits = 32 bytes, and each byte is 2 hex characters, so the length is **64**. The output size is fixed regardless of the input size.',
  },
  {
    id: 'sec-14', topic: 'sec', sub: 'CI/CD & Testing', type: 'scenario', difficulty: 2,
    q: 'A developer accidentally pushed an AWS secret key to a public GitHub repo, then deleted it in the next commit. What should happen first?',
    options: [
      'Nothing; it was deleted',
      'Revoke/rotate the key immediately, then purge history and add secret scanning to CI',
      'Make the repo private',
      'Force-push to hide it and move on',
    ],
    answer: 1,
    explain: 'Assume the secret is compromised the moment it is public; bots scrape GitHub within minutes. Rotate first, then clean up, and use a secret manager plus pre-commit or CI scanning.',
  },
  {
    id: 'sec-15', topic: 'sec', sub: 'Auth', type: 'mcq', difficulty: 2,
    q: 'What does OpenID Connect add on top of OAuth 2.0?',
    options: ['Encryption of access tokens', 'An authentication layer: an ID token (JWT) describing the signed-in user', 'Password storage', 'Rate limiting'],
    answer: 1,
    explain: 'OAuth 2.0 is for delegated **authorization** (access tokens). OIDC adds **authentication** (ID token, `/userinfo`). The Authorization Code flow with PKCE is the recommended flow for public clients.',
  },

  /* =================== AI / ML / DATA SCIENCE =================== */
  {
    id: 'ai-01', topic: 'ai', sub: 'ML Paradigms', type: 'scenario', difficulty: 1,
    q: 'Marketing wants to group customers into segments based on purchasing behavior. There are **no labels**. Which approach fits?',
    options: ['Supervised classification', 'Unsupervised clustering (e.g., k-means)', 'Linear regression', 'Reinforcement learning'],
    answer: 1,
    explain: 'With no target labels, use unsupervised learning to discover structure: clustering, or dimensionality reduction (PCA).',
  },
  {
    id: 'ai-02', topic: 'ai', sub: 'ML Paradigms', type: 'mcq', difficulty: 1,
    q: 'Predicting a house\'s sale **price** from its features is a:',
    options: ['Classification problem', 'Regression problem', 'Clustering problem', 'Association rule problem'],
    answer: 1,
    explain: 'Regression predicts a continuous value; classification predicts a discrete category, such as "will sell within 30 days: yes/no".',
  },
  {
    id: 'ai-03', topic: 'ai', sub: 'Overfitting & Bias', type: 'mcq', difficulty: 2,
    q: 'Training accuracy is 99% but validation accuracy is 72%. What is happening, and what could help?',
    options: [
      'Underfitting; add more layers',
      'Overfitting; use regularization (L1/L2, dropout), more data or augmentation, a simpler model, or early stopping',
      'Data is perfect; deploy',
      'Learning rate is too low; train longer',
    ],
    answer: 1,
    explain: 'A large train/validation gap means high variance: the model memorizes noise. Underfitting (high bias) shows low accuracy on both sets.',
  },
  {
    id: 'ai-04', topic: 'ai', sub: 'Metrics', type: 'mcq', difficulty: 1,
    q: 'Precision is defined as:',
    options: ['TP / (TP + FN)', 'TP / (TP + FP)', '(TP + TN) / total', 'TN / (TN + FP)'],
    answer: 1,
    rationale: ['That is recall (sensitivity).', 'Correct: of the predicted positives, how many are real.', 'That is accuracy.', 'That is specificity.'],
    explain: 'Precision answers "When I say positive, am I right?" Recall answers "Of all the actual positives, how many did I find?" F1 is their harmonic mean.',
  },
  {
    id: 'ai-05', topic: 'ai', sub: 'Metrics', type: 'output', difficulty: 2,
    q: 'Given this confusion matrix, what is the **recall**? (decimal, two places)',
    lang: 'text',
    code: `TP = 40   FP = 10
FN = 20   TN = 30`,
    accept: ['0.67', '.67', '0.667', '2/3', '67%', '66.7%', '0.6667'], answer: '0.67',
    explain: 'Recall = TP / (TP + FN) = 40 / 60 ≈ **0.67**. Precision = 40/50 = 0.80. Accuracy = 70/100 = 0.70.',
  },
  {
    id: 'ai-06', topic: 'ai', sub: 'Metrics', type: 'scenario', difficulty: 2,
    q: 'Only 0.5% of transactions are fraudulent. A model that predicts "not fraud" for everything gets 99.5% accuracy. What should you do?',
    options: [
      'Ship it; 99.5% is excellent',
      'Evaluate with precision, recall, F1 or PR-AUC, and handle the imbalance (class weights, resampling, threshold tuning)',
      'Use accuracy but on more data',
      'Remove the fraud cases from the dataset',
    ],
    answer: 1,
    explain: 'Accuracy is misleading on imbalanced data; that model has 0% recall for fraud. Choose metrics that reflect what each kind of error costs the business.',
  },
  {
    id: 'ai-07', topic: 'ai', sub: 'Neural Networks', type: 'mcq', difficulty: 2,
    q: 'Why is ReLU, f(x) = max(0, x), popular in deep networks?',
    options: ['It outputs probabilities', 'It is cheap to compute and reduces the vanishing-gradient problem compared with sigmoid/tanh', 'It is bounded between -1 and 1', 'It prevents overfitting by itself'],
    answer: 1,
    explain: 'Sigmoid and tanh saturate, so their gradients approach 0 for large |x|. ReLU has gradient 1 for x > 0. Watch out for "dying ReLUs"; Leaky ReLU and GELU are alternatives.',
  },
  {
    id: 'ai-08', topic: 'ai', sub: 'Neural Networks', type: 'mcq', difficulty: 2,
    q: 'What does backpropagation compute?',
    options: ['The network architecture', 'Gradients of the loss with respect to every weight, via the chain rule', 'The training dataset', 'The final predictions only'],
    answer: 1,
    explain: 'Forward pass → loss → backward pass (gradients) → an optimizer (SGD, Adam) updates the weights, w ← w − η·∂L/∂w.',
  },
  {
    id: 'ai-09', topic: 'ai', sub: 'Overfitting & Bias', type: 'mcq', difficulty: 1,
    q: 'In k-fold cross-validation, what is the main purpose?',
    options: ['To speed up training', 'To get a more reliable performance estimate by training/validating on k different splits', 'To increase dataset size', 'To tune the learning rate automatically'],
    answer: 1,
    explain: 'Each fold serves as the validation set once, and the k scores are averaged. This is useful for model selection and hyperparameter tuning on limited data.',
  },
  {
    id: 'ai-10', topic: 'ai', sub: 'Data Science', type: 'scenario', difficulty: 3,
    q: 'A data scientist standardizes (z-scores) the **entire** dataset, then splits it into train/test, and gets great test scores. What is wrong?',
    options: [
      'Nothing',
      'Data leakage: the test set\'s statistics influenced the scaling. Fit the scaler on the training data only (e.g., inside a Pipeline)',
      'Standardization should never be used',
      'The split ratio must be 50/50',
    ],
    answer: 1,
    explain: 'Any preprocessing that learns parameters (scaling, imputation, feature selection) must be fit on the training folds only, or the evaluation is optimistically biased.',
  },
  {
    id: 'ai-11', topic: 'ai', sub: 'Data Science', type: 'output', difficulty: 2,
    q: 'What does this print? (exact NumPy formatting)',
    lang: 'python',
    code: `import numpy as np
a = np.array([[1, 2], [3, 4]])
print(a.shape, a.sum(axis=0))`,
    accept: ['(2, 2) [4 6]'], answer: '(2, 2) [4 6]',
    explain: '`shape` is (rows, cols) = (2, 2). `axis=0` collapses the rows, summing down each column: [1+3, 2+4] = [4 6].',
  },
  {
    id: 'ai-12', topic: 'ai', sub: 'ML Paradigms', type: 'mcq', difficulty: 1,
    q: 'An agent learns to play a game by receiving rewards and penalties for its actions. This is:',
    options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Transfer learning'],
    answer: 2,
    explain: 'RL is about an agent, an environment, states, actions and rewards, where the goal is to maximize cumulative reward (Q-learning, policy gradients). RLHF uses it to align language models.',
  },
  {
    id: 'ai-13', topic: 'ai', sub: 'Neural Networks', type: 'mcq', difficulty: 2,
    q: 'What mechanism is at the core of the Transformer architecture?',
    options: ['Convolution', 'Self-attention', 'Recurrence (LSTM gates)', 'Decision trees'],
    answer: 1,
    explain: 'Self-attention lets every token weigh every other token in parallel. CNNs dominate classic vision tasks, while RNNs and LSTMs process sequences step by step.',
  },
  {
    id: 'ai-14', topic: 'ai', sub: 'Overfitting & Bias', type: 'mcq', difficulty: 2,
    q: 'A model with **high bias** typically:',
    options: ['Overfits', 'Underfits: it is too simple to capture the pattern, with high error on both train and test', 'Has perfect accuracy', 'Has high variance'],
    answer: 1,
    explain: 'Bias–variance trade-off: a simple model has high bias, a complex model has high variance. The goal is the sweet spot that minimizes total error.',
  },

  /* =================== DESIGN & ARCHITECTURE =================== */
  {
    id: 'arch-01', topic: 'arch', sub: 'SOLID', type: 'mcq', difficulty: 1,
    q: 'The **Open/Closed Principle** states that software entities should be:',
    options: ['Open for modification, closed for extension', 'Open for extension, closed for modification', 'Publicly accessible', 'Closed source'],
    answer: 1,
    explain: 'Add behavior with new code (subclasses, strategies, plugins) instead of editing working code. The Strategy pattern is a classic way to achieve OCP.',
  },
  {
    id: 'arch-02', topic: 'arch', sub: 'SOLID', type: 'scenario', difficulty: 2,
    q: '`Square extends Rectangle`. `setWidth(5)` on a Square also changes its height, so code expecting a Rectangle (`area == w*h`) breaks. Which principle is violated?',
    options: ['Single Responsibility', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion'],
    answer: 1,
    explain: 'LSP: subtypes must be usable anywhere their base type is expected without breaking correctness. Prefer composition or separate immutable shapes.',
  },
  {
    id: 'arch-03', topic: 'arch', sub: 'SOLID', type: 'mcq', difficulty: 2,
    q: 'Dependency Inversion Principle:',
    options: [
      'Low-level modules should depend on high-level modules',
      'High-level modules should not depend on low-level modules; both should depend on abstractions',
      'Dependencies should be installed globally',
      'Classes should have only one dependency',
    ],
    answer: 1,
    explain: 'For example, `OrderService` depends on a `PaymentGateway` interface, not on `StripeClient` directly. Dependency injection supplies the concrete implementation, which also makes testing with mocks easy.',
  },
  {
    id: 'arch-04', topic: 'arch', sub: 'Design Patterns', type: 'scenario', difficulty: 1,
    q: 'Several UI widgets must update automatically whenever a stock price changes, without the price source knowing their concrete classes. Which pattern?',
    options: ['Singleton', 'Observer', 'Adapter', 'Builder'],
    answer: 1,
    explain: 'Observer (publish/subscribe): the subject keeps a list of subscribers and notifies them on change. It underlies event listeners, RxJS and reactive UIs.',
  },
  {
    id: 'arch-05', topic: 'arch', sub: 'Design Patterns', type: 'scenario', difficulty: 2,
    q: 'Checkout must support interchangeable shipping-cost algorithms (standard, express, pickup) chosen at runtime. Which pattern?',
    options: ['Strategy', 'Decorator', 'Facade', 'Prototype'],
    answer: 0,
    explain: 'Strategy wraps each algorithm behind a common interface, so the context delegates to whichever one is configured. This replaces large if/else chains.',
  },
  {
    id: 'arch-06', topic: 'arch', sub: 'Design Patterns', type: 'mcq', difficulty: 2,
    q: 'You must use a third-party library whose interface does not match what your code expects. Which pattern converts one interface into another?',
    options: ['Adapter', 'Observer', 'Command', 'Singleton'],
    answer: 0,
    explain: 'Adapter wraps an existing class with the interface clients expect. Decorator adds behavior while keeping the same interface, and Facade simplifies a whole subsystem.',
  },
  {
    id: 'arch-07', topic: 'arch', sub: 'Microservices', type: 'mcq', difficulty: 2,
    q: 'What is a key **trade-off** of microservices compared with a modular monolith?',
    options: [
      'They cannot scale',
      'Independent deployment and scaling, at the cost of distributed-systems complexity (network failures, data consistency, observability)',
      'They require a single shared database',
      'They eliminate the need for APIs',
    ],
    answer: 1,
    explain: 'Each service owns its data and deploys independently, which brings eventual consistency, sagas, tracing and versioned contracts. Start with a monolith unless team or scale needs justify splitting.',
  },
  {
    id: 'arch-08', topic: 'arch', sub: 'Microservices', type: 'scenario', difficulty: 2,
    q: 'Service A calls Service B, which is timing out. A\'s threads pile up waiting, and A goes down too (cascading failure). Which pattern helps?',
    options: ['Circuit Breaker (with timeouts and fallbacks)', 'Singleton', 'Template Method', 'Active Record'],
    answer: 0,
    explain: 'After N failures the breaker "opens" and fails fast for a cooldown, then "half-opens" to probe recovery. Combine it with timeouts, retries with backoff and bulkheads.',
  },
  {
    id: 'arch-09', topic: 'arch', sub: 'OOP', type: 'output', difficulty: 1,
    q: 'What does this Java code print?',
    lang: 'java',
    code: `class Animal { String sound() { return "..."; } }
class Dog extends Animal {
    @Override String sound() { return "Woof"; }
}

Animal a = new Dog();
System.out.println(a.sound());`,
    accept: ['Woof'], answer: 'Woof',
    explain: 'Runtime (dynamic) polymorphism: the method is chosen from the object\'s actual class (`Dog`), not the variable\'s declared type.',
  },
  {
    id: 'arch-10', topic: 'arch', sub: 'OOP', type: 'output', difficulty: 1,
    q: 'What does this print?',
    lang: 'python',
    code: `class Counter:
    count = 0
    def __init__(self):
        Counter.count += 1

a, b, c = Counter(), Counter(), Counter()
print(Counter.count)`,
    accept: ['3'], answer: '3',
    explain: '`count` is a **class attribute** shared by all instances. Each constructor call increments it.',
  },
  {
    id: 'arch-11', topic: 'arch', sub: 'OOP', type: 'mcq', difficulty: 1,
    q: 'Which OOP principle hides internal state and exposes behavior only through methods?',
    options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction of hardware'],
    answer: 2,
    explain: 'Encapsulation protects invariants (e.g., a balance cannot go negative). The other pillars are abstraction, inheritance and polymorphism.',
  },
  {
    id: 'arch-12', topic: 'arch', sub: 'Architecture Styles', type: 'mcq', difficulty: 1,
    q: 'Good modular design aims for:',
    options: ['High coupling, low cohesion', 'Low coupling, high cohesion', 'High coupling, high cohesion', 'Low coupling, low cohesion'],
    answer: 1,
    explain: 'Cohesion: each module\'s elements belong together. Coupling: how much modules depend on each other. Low coupling localizes the impact of changes.',
  },
  {
    id: 'arch-13', topic: 'arch', sub: 'Architecture Styles', type: 'mcq', difficulty: 1,
    q: 'In MVC, which component handles user input and coordinates updates?',
    options: ['Model', 'View', 'Controller', 'Router table'],
    answer: 2,
    explain: 'The Model holds data and business rules, the View renders, and the Controller interprets input and updates the Model and View.',
  },
  {
    id: 'arch-14', topic: 'arch', sub: 'Architecture Styles', type: 'scenario', difficulty: 3,
    q: 'Read traffic is 100× write traffic, and the dashboards run heavy aggregations that slow down transactional writes. Which architectural approach fits best?',
    options: [
      'Put everything in one bigger server',
      'CQRS: separate the write model from optimized read models (read replicas or denormalized projections), accepting eventual consistency',
      'Remove the dashboards',
      'Use a Singleton for the database connection',
    ],
    answer: 1,
    explain: 'Command Query Responsibility Segregation lets each side scale and be modeled independently. It is often paired with event-driven projections.',
  },
  {
    id: 'arch-15', topic: 'arch', sub: 'SDLC & Process', type: 'mcq', difficulty: 1,
    q: 'In Scrum, who owns and orders the Product Backlog?',
    options: ['The Scrum Master', 'The Product Owner', 'The Development Team lead', 'The CTO'],
    answer: 1,
    explain: 'The Product Owner maximizes value by ordering the backlog. The Scrum Master coaches the process and removes impediments. Developers build the increment each Sprint.',
  },
  {
    id: 'arch-16', topic: 'arch', sub: 'Design Patterns', type: 'mcq', difficulty: 2,
    q: 'Why is the Singleton pattern often considered an anti-pattern?',
    options: ['It uses too much memory', 'It introduces hidden global state, tight coupling and makes unit testing harder', 'It cannot be thread-safe', 'It is not supported in Java'],
    answer: 1,
    explain: 'Prefer dependency injection with a single instance managed by the composition root or DI container.',
  },
];
