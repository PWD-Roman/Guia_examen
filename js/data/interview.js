/* Interview simulator content.
   theory[].points: each key point has keywords; if any keyword appears in the
   candidate's answer the point is auto-detected (the candidate can still adjust). */
window.SH.interview = {
  theory: [
    {
      id: 'it-01', topic: 'web', kind: 'CS Trivia', difficulty: 2,
      q: 'Walk me through what happens when you type https://example.com into a browser and press Enter.',
      points: [
        { text: 'DNS resolution (cache → resolver → root/TLD/authoritative)', kw: ['dns', 'resolve', 'resolver', 'ip address'] },
        { text: 'TCP connection (3-way handshake) or QUIC', kw: ['tcp', 'handshake', 'syn', 'quic'] },
        { text: 'TLS handshake: certificate validation and key exchange', kw: ['tls', 'ssl', 'certificate', 'encrypt'] },
        { text: 'HTTP request/response (method, headers, status)', kw: ['http', 'get request', 'request', 'response', 'status'] },
        { text: 'Rendering: parse HTML/CSS → DOM/CSSOM → layout → paint, JS execution', kw: ['dom', 'render', 'parse', 'paint', 'layout'] },
      ],
      model: 'The browser parses the URL and checks its caches. DNS resolves the hostname to an IP, walking recursive resolver → root → .com TLD → authoritative server if nothing is cached. It opens a TCP connection (SYN, SYN-ACK, ACK), or QUIC for HTTP/3, then performs the TLS handshake: it validates the certificate chain and agrees on session keys with ECDHE. It sends `GET /` with headers such as Host and cookies. The server, perhaps behind a load balancer or CDN, returns a response, e.g. 200 with HTML. The browser parses the HTML into the DOM and the CSS into the CSSOM, fetches sub-resources, runs JS, builds the render tree, then lays out, paints and composites.',
    },
    {
      id: 'it-02', topic: 'db', kind: 'CS Trivia', difficulty: 2,
      q: 'Explain database indexes. How do they work, and when can they hurt performance?',
      points: [
        { text: 'Data structure (B-tree / B+tree) enabling O(log n) lookups', kw: ['b-tree', 'btree', 'b+tree', 'tree', 'log n'] },
        { text: 'Avoids full table scans for WHERE / JOIN / ORDER BY', kw: ['full scan', 'table scan', 'where', 'join', 'order by', 'lookup'] },
        { text: 'Composite index column order (leftmost prefix)', kw: ['composite', 'leftmost', 'multi-column', 'column order'] },
        { text: 'Cost: slower writes and extra storage', kw: ['write', 'insert', 'update', 'storage', 'space'] },
        { text: 'Low selectivity or functions on columns can make indexes useless', kw: ['selectivity', 'cardinality', 'function', 'sargable'] },
      ],
      model: 'An index is a separate structure, usually a B+tree, that maps key values to row locations, so lookups take O(log n) instead of a full scan. It helps WHERE filters, JOINs and ORDER BY. Composite indexes follow the leftmost-prefix rule: put equality columns first, then range columns. Every INSERT, UPDATE and DELETE must maintain each index, so writes slow down and storage grows. Indexes help little on low-selectivity columns (e.g. a boolean) or when the query wraps the column in a function. Use EXPLAIN to verify.',
    },
    {
      id: 'it-03', topic: 'arch', kind: 'CS Trivia', difficulty: 1,
      q: 'What are the SOLID principles? Give a short example of one of them.',
      points: [
        { text: 'Single Responsibility', kw: ['single responsibility', 'one reason'] },
        { text: 'Open/Closed', kw: ['open/closed', 'open closed', 'open for extension'] },
        { text: 'Liskov Substitution', kw: ['liskov', 'substitut'] },
        { text: 'Interface Segregation', kw: ['interface segregation', 'segregat'] },
        { text: 'Dependency Inversion (+ a concrete example)', kw: ['dependency inversion', 'abstraction', 'inject'] },
      ],
      model: 'S: a class should have one reason to change. O: open for extension, closed for modification. L: subtypes must be substitutable for their base types. I: prefer small, client-specific interfaces. D: depend on abstractions. Example for D: `OrderService` receives a `PaymentGateway` interface through its constructor instead of instantiating `StripeClient`, so you can swap providers or inject a mock in tests.',
    },
    {
      id: 'it-04', topic: 'algo', kind: 'CS Trivia', difficulty: 2,
      q: 'Compare arrays, linked lists and hash tables. When would you choose each?',
      points: [
        { text: 'Array: O(1) index access, contiguous memory, cache friendly', kw: ['contiguous', 'o(1) access', 'index', 'cache'] },
        { text: 'Array: insert/delete in middle is O(n)', kw: ['shift', 'o(n) insert', 'insert'] },
        { text: 'Linked list: O(1) insert/delete at known node, O(n) access', kw: ['node', 'pointer', 'linked'] },
        { text: 'Hash table: O(1) average lookup by key, collisions', kw: ['hash', 'collision', 'bucket', 'key'] },
        { text: 'Concrete use cases for each', kw: ['use case', 'lru', 'cache', 'queue', 'lookup', 'when'] },
      ],
      model: 'Arrays give O(1) random access and great cache locality, but inserting or deleting in the middle is O(n). Use them for indexed data and iteration. Linked lists give O(1) insert and delete at a known node but O(n) access and poor locality. Use them for queues, or with a hash map in an LRU cache. Hash tables give O(1) average lookup, insert and delete by key (O(n) worst case on collisions) and are unordered. Use them for dictionaries, deduplication, counting and caching.',
    },
    {
      id: 'it-05', topic: 'sec', kind: 'CS Trivia', difficulty: 2,
      q: 'How would you securely implement user authentication for a web application?',
      points: [
        { text: 'Hash passwords with Argon2/bcrypt (salted, slow)', kw: ['bcrypt', 'argon', 'scrypt', 'hash', 'salt'] },
        { text: 'HTTPS everywhere', kw: ['https', 'tls'] },
        { text: 'Secure session/token handling (HttpOnly, Secure, SameSite, expiry)', kw: ['httponly', 'samesite', 'secure cookie', 'session', 'jwt', 'expir'] },
        { text: 'MFA and rate limiting / lockout', kw: ['mfa', '2fa', 'multi-factor', 'rate limit', 'lockout', 'brute'] },
        { text: 'CSRF protection and generic error messages', kw: ['csrf', 'generic', 'enumeration'] },
      ],
      model: 'Serve everything over HTTPS. Store passwords with Argon2id or bcrypt using unique salts. On login, issue a session ID in an HttpOnly, Secure, SameSite cookie, or short-lived tokens plus rotating refresh tokens. Rate-limit login attempts and offer MFA (TOTP or WebAuthn). Return generic errors to avoid user enumeration, add CSRF protection, rotate the session ID after login, and log authentication events. Consider delegating to an OIDC provider.',
    },
    {
      id: 'it-06', topic: 'prog', kind: 'CS Trivia', difficulty: 2,
      q: 'What is the difference between a process and a thread? How do you avoid race conditions?',
      points: [
        { text: 'Process has its own memory space; threads share memory within a process', kw: ['memory space', 'address space', 'share memory', 'shared memory'] },
        { text: 'Threads are lighter (cheaper context switch / creation)', kw: ['lightweight', 'lighter', 'context switch', 'cheaper'] },
        { text: 'Race condition = unsynchronized access to shared state', kw: ['race', 'shared state', 'concurrent'] },
        { text: 'Locks / mutexes / semaphores / atomics', kw: ['mutex', 'lock', 'semaphore', 'atomic', 'synchronized'] },
        { text: 'Deadlock awareness or immutability / message passing', kw: ['deadlock', 'immutable', 'message passing', 'actor', 'channel'] },
      ],
      model: 'A process is an independent program instance with its own address space. Threads run inside a process and share its memory, which makes them cheaper to create and switch, but shared state is dangerous. A race condition occurs when the result depends on the timing of unsynchronized accesses, e.g. two threads running `count++`. Prevent races with mutexes or locks, atomics, or semaphores, keeping critical sections small. Avoid deadlocks by acquiring locks in a consistent order, or design them away with immutability and message passing (actors, channels).',
    },
    {
      id: 'it-07', topic: 'ai', kind: 'CS Trivia', difficulty: 2,
      q: 'Explain overfitting and how you would detect and prevent it.',
      points: [
        { text: 'Definition: model memorizes training data/noise, poor generalization', kw: ['memoriz', 'noise', 'generaliz'] },
        { text: 'Detection: gap between training and validation/test performance', kw: ['validation', 'gap', 'test set', 'learning curve'] },
        { text: 'Regularization (L1/L2, dropout)', kw: ['regulariz', 'l1', 'l2', 'dropout'] },
        { text: 'More data / augmentation / simpler model', kw: ['more data', 'augment', 'simpler', 'fewer features'] },
        { text: 'Cross-validation / early stopping', kw: ['cross-validation', 'cross validation', 'k-fold', 'early stopping'] },
      ],
      model: 'Overfitting happens when a model fits the noise in its training set and fails to generalize. Detect it by comparing training and validation metrics (a large gap) or with learning curves. Prevent it with more or augmented data, regularization (L1/L2, dropout), simpler models or feature selection, early stopping, ensembling, and k-fold cross-validation for honest model selection.',
    },
    {
      id: 'it-08', topic: 'web', kind: 'CS Trivia', difficulty: 1,
      q: 'REST vs GraphQL vs WebSockets: when would you use each?',
      points: [
        { text: 'REST: resource-oriented, HTTP verbs, cacheable, simple', kw: ['resource', 'verbs', 'cache', 'stateless'] },
        { text: 'GraphQL: client chooses fields, single endpoint, avoids over/under-fetching', kw: ['over-fetch', 'overfetch', 'under-fetch', 'fields', 'single endpoint', 'schema'] },
        { text: 'WebSockets: persistent bidirectional real-time', kw: ['real-time', 'realtime', 'bidirectional', 'persistent', 'push'] },
        { text: 'Trade-offs (caching, complexity, scaling connections)', kw: ['trade', 'complex', 'scal'] },
      ],
      model: 'REST suits CRUD over resources, takes advantage of HTTP caching and status codes, and is simple to consume. GraphQL suits varied clients (e.g. mobile vs web) that need different shapes of nested data: one typed endpoint, no over- or under-fetching, but HTTP caching is harder and query cost must be controlled. WebSockets suit real-time bidirectional updates (chat, collaboration, live prices), at the cost of stateful connections that complicate scaling.',
    },
    {
      id: 'sd-01', topic: 'arch', kind: 'System Design', difficulty: 2,
      q: 'Design a URL shortener (like bit.ly) handling 100M new URLs per month and a 100:1 read/write ratio.',
      points: [
        { text: 'Requirements and estimates (≈40 writes/s, ≈4k reads/s, storage)', kw: ['qps', 'per second', 'storage', 'estimate', 'requirement'] },
        { text: 'Key generation: base62 encoding of an ID / counter / hash with collision handling', kw: ['base62', 'base 62', 'hash', 'counter', 'collision', 'id generat'] },
        { text: 'Data store: key-value / NoSQL or SQL with index on short code', kw: ['key-value', 'nosql', 'dynamo', 'cassandra', 'database', 'sql'] },
        { text: 'Caching hot URLs (Redis/CDN) for reads', kw: ['cache', 'redis', 'cdn', 'memcached'] },
        { text: 'Redirect semantics (301 vs 302), analytics, expiry', kw: ['301', '302', 'redirect', 'analytics', 'expir'] },
        { text: 'Scaling: load balancer, replication/sharding', kw: ['load balanc', 'shard', 'replica', 'horizontal'] },
      ],
      model: 'Estimates: 100M writes a month is about 40 writes/s; at 100:1 that is about 4,000 reads/s, with peaks maybe 10×. Five years of data is about 6B records × ~500 B ≈ 3 TB. API: `POST /urls {longUrl}` → `{shortUrl}`, and `GET /{code}` → redirect. Keys: 7 base62 characters give 62⁷ ≈ 3.5 trillion codes, generated from a distributed ID service (ranges handed out per server) or from a hash with collision checks. Store code → URL in a key-value store (DynamoDB or Cassandra) or sharded SQL. Reads go through a Redis cache and the CDN edge (80/20 hot set). Use 302 if you need analytics on every hit, 301 to let browsers cache. Analytics go to a queue (Kafka) for async aggregation. Stateless app servers sit behind a load balancer, with replication for availability.',
    },
    {
      id: 'sd-02', topic: 'arch', kind: 'System Design', difficulty: 3,
      q: 'Design a real-time chat system (one-to-one and group chats) for 10M daily active users.',
      points: [
        { text: 'Persistent connections (WebSockets) via gateway servers', kw: ['websocket', 'persistent', 'long poll', 'gateway'] },
        { text: 'Message routing across servers (pub/sub, Redis, Kafka)', kw: ['pub/sub', 'pubsub', 'kafka', 'redis', 'broker', 'queue'] },
        { text: 'Storage for messages (wide-column / partition by conversation)', kw: ['cassandra', 'hbase', 'partition', 'conversation id', 'store messages'] },
        { text: 'Delivery guarantees: ordering, acks, offline messages, push notifications', kw: ['order', 'ack', 'offline', 'push notification', 'sequence'] },
        { text: 'Presence / online status and read receipts', kw: ['presence', 'online', 'heartbeat', 'read receipt'] },
        { text: 'Scaling & reliability (sharding, replication, fan-out for groups)', kw: ['shard', 'replica', 'fan-out', 'fanout', 'scale'] },
      ],
      model: 'Clients hold WebSocket connections to stateless gateway servers behind an L4 load balancer; a session registry in Redis maps user → gateway. On send, the gateway persists the message (Cassandra, partitioned by conversation_id and clustered by a time-ordered message ID such as a Snowflake ID) and publishes it to a broker (Kafka or Redis pub/sub). Recipient gateways push it to online users. Offline users receive APNs/FCM push notifications and sync from their last acknowledged ID on reconnect. Per-conversation sequence numbers give ordering, and client acks give at-least-once delivery with idempotent dedup. Presence comes from heartbeats with a TTL in Redis. Large groups fan out on read, or use a hybrid. Add monitoring, rate limiting and end-to-end encryption if required.',
    },
    {
      id: 'sd-03', topic: 'arch', kind: 'System Design', difficulty: 2,
      q: 'Design a rate limiter for a public API (e.g., 100 requests per minute per API key).',
      points: [
        { text: 'Algorithm: token bucket / leaky bucket / sliding window', kw: ['token bucket', 'leaky', 'sliding window', 'fixed window'] },
        { text: 'Where: API gateway / middleware', kw: ['gateway', 'middleware', 'reverse proxy', 'nginx'] },
        { text: 'Shared state in Redis with atomic ops (INCR/Lua) and TTL', kw: ['redis', 'atomic', 'incr', 'lua', 'ttl'] },
        { text: 'Response: 429 with Retry-After / rate-limit headers', kw: ['429', 'retry-after', 'x-ratelimit'] },
        { text: 'Distributed concerns: race conditions, clock skew, fail-open vs fail-closed', kw: ['race', 'fail open', 'fail-open', 'fail closed', 'distributed', 'clock'] },
      ],
      model: 'Enforce limits in the API gateway or middleware, keyed by API key, user or IP. A token bucket allows bursts up to capacity while refilling at a steady rate; a sliding window log or counter is more precise than fixed windows, which allow 2× bursts at window edges. Keep the counters in Redis and update them atomically (Lua script, or INCR plus EXPIRE) so all gateway instances share one view. Return 429 with Retry-After and X-RateLimit-Limit/Remaining headers. Decide whether to fail open or fail closed if Redis is down, use local caches to cut latency, and offer per-tier limits.',
    },
    {
      id: 'it-09', topic: 'sec', kind: 'CS Trivia', difficulty: 1,
      q: 'What does a good CI/CD pipeline include, and why does it matter for software quality?',
      points: [
        { text: 'Automated build on every commit / PR', kw: ['every commit', 'pull request', 'pr', 'automat', 'build'] },
        { text: 'Automated tests (unit, integration) with coverage gates', kw: ['unit test', 'integration', 'test', 'coverage'] },
        { text: 'Static analysis / linting / security scanning (SAST, dependency scan)', kw: ['lint', 'static analysis', 'sast', 'scan', 'audit', 'sonar'] },
        { text: 'Deployment to staging, then production (blue-green / canary, rollback)', kw: ['staging', 'canary', 'blue-green', 'blue green', 'rollback', 'deploy'] },
        { text: 'Fast feedback, fewer regressions, repeatable releases', kw: ['feedback', 'regression', 'repeatable', 'reliab'] },
      ],
      model: 'On every PR the pipeline checks out the code and runs lint and format checks, unit and integration tests with coverage thresholds, SAST and dependency vulnerability scans, and builds an immutable artifact (e.g. a container image). It deploys automatically to staging, runs smoke and E2E tests, then promotes to production via canary or blue-green with automated rollback on failing health checks. The payoff is fast feedback, early defect detection, consistent and repeatable releases, and better maintainability and reliability (ISO 25010).',
    },
  ],

  /* Coding challenges, solved in JavaScript and run against tests in a Web Worker. */
  coding: [
    {
      id: 'cc-two-sum', title: 'Two Sum', difficulty: 1, topic: 'algo', fn: 'twoSum',
      prompt: 'Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`. Exactly one solution exists, and you may not use the same element twice. Return the indices in any order.',
      examples: ['twoSum([2, 7, 11, 15], 9) → [0, 1]', 'twoSum([3, 2, 4], 6) → [1, 2]'],
      starter: `function twoSum(nums, target) {
  // Your code here
}`,
      tests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[3, 2, 4], 6], expected: [1, 2] },
        { args: [[3, 3], 6], expected: [0, 1] },
        { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
        { args: [[0, 4, 3, 0], 0], expected: [0, 3] },
      ],
      compare: 'unordered',
      hints: [
        'Brute force: check every pair (i, j). That is O(n²). Can you avoid the inner loop?',
        'For each number x, you are looking for `target - x`. Which data structure answers "have I seen this value?" in O(1)?',
        'Use a Map from value → index. Loop once: if the map has `target - nums[i]`, return both indices; otherwise store `nums[i] → i`.',
      ],
      solution: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      id: 'cc-valid-parens', title: 'Valid Parentheses', difficulty: 1, topic: 'algo', fn: 'isValid',
      prompt: 'Given a string containing only `()[]{}`, return `true` if every bracket is closed by the same type of bracket and in the correct order.',
      examples: ['isValid("()[]{}") → true', 'isValid("(]") → false', 'isValid("{[]}") → true'],
      starter: `function isValid(s) {
  // Your code here
}`,
      tests: [
        { args: ['()'], expected: true },
        { args: ['()[]{}'], expected: true },
        { args: ['(]'], expected: false },
        { args: ['([)]'], expected: false },
        { args: ['{[]}'], expected: true },
        { args: [''], expected: true },
        { args: ['(('], expected: false },
        { args: ['))'], expected: false },
      ],
      hints: [
        'The most recently opened bracket must be closed first. Which data structure is Last-In-First-Out?',
        'Push opening brackets onto a stack. On a closing bracket, the top of the stack must be its matching opener.',
        'At the end, the stack must be empty. Map closers to openers: `{ ")": "(", "]": "[", "}": "{" }`.',
      ],
      solution: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      id: 'cc-binary-search', title: 'Binary Search', difficulty: 1, topic: 'algo', fn: 'search',
      prompt: 'Given a sorted (ascending) array of distinct integers `nums` and a `target`, return the index of `target`, or `-1` if it is not present. Your algorithm must run in **O(log n)**.',
      examples: ['search([-1, 0, 3, 5, 9, 12], 9) → 4', 'search([-1, 0, 3, 5, 9, 12], 2) → -1'],
      starter: `function search(nums, target) {
  // Your code here
}`,
      tests: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
        { args: [[5], 5], expected: 0 },
        { args: [[], 1], expected: -1 },
        { args: [[1, 3, 5, 7, 9, 11, 13], 1], expected: 0 },
        { args: [[1, 3, 5, 7, 9, 11, 13], 13], expected: 6 },
      ],
      hints: [
        'Keep two pointers, `lo = 0` and `hi = n - 1`, and look at the middle element.',
        'If `nums[mid] < target`, the answer can only be to the right: `lo = mid + 1`. Otherwise go left.',
        'Loop while `lo <= hi`. Compute mid as `Math.floor((lo + hi) / 2)`, or `lo + ((hi - lo) >> 1)` to avoid overflow in other languages.',
      ],
      solution: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      id: 'cc-climb', title: 'Climbing Stairs', difficulty: 1, topic: 'algo', fn: 'climbStairs',
      prompt: 'You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?',
      examples: ['climbStairs(2) → 2   (1+1, 2)', 'climbStairs(3) → 3   (1+1+1, 1+2, 2+1)'],
      starter: `function climbStairs(n) {
  // Your code here
}`,
      tests: [
        { args: [1], expected: 1 },
        { args: [2], expected: 2 },
        { args: [3], expected: 3 },
        { args: [5], expected: 8 },
        { args: [10], expected: 89 },
        { args: [45], expected: 1836311903 },
      ],
      hints: [
        'To reach step n, your last move was either from step n-1 or from step n-2.',
        'So ways(n) = ways(n-1) + ways(n-2). Look familiar? Naive recursion will be too slow for n = 45.',
        'Iterate bottom-up keeping only the last two values (O(1) space).',
      ],
      solution: `function climbStairs(n) {
  let a = 1, b = 1; // ways(0), ways(1)
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      id: 'cc-max-subarray', title: 'Maximum Subarray', difficulty: 2, topic: 'algo', fn: 'maxSubArray',
      prompt: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) with the largest sum and return **that sum**.',
      examples: ['maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) → 6   ([4,-1,2,1])', 'maxSubArray([-3,-1,-2]) → -1'],
      starter: `function maxSubArray(nums) {
  // Your code here
}`,
      tests: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { args: [[1]], expected: 1 },
        { args: [[5, 4, -1, 7, 8]], expected: 23 },
        { args: [[-3, -1, -2]], expected: -1 },
        { args: [[2, -1, 2, -1, 2]], expected: 4 },
      ],
      hints: [
        'Brute force checks every (i, j) pair: O(n²). Think about the best subarray that **ends** at index i.',
        'The best sum ending at i is either `nums[i]` alone or `nums[i] + bestEndingAt(i-1)`. Take the max.',
        "Kadane's algorithm: `cur = Math.max(x, cur + x); best = Math.max(best, cur)`. Initialize both with nums[0] so all-negative arrays work.",
      ],
      solution: `function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      id: 'cc-longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 2, topic: 'algo', fn: 'lengthOfLongestSubstring',
      prompt: 'Given a string `s`, return the length of the longest substring that has no repeating characters.',
      examples: ['lengthOfLongestSubstring("abcabcbb") → 3   ("abc")', 'lengthOfLongestSubstring("pwwkew") → 3   ("wke")'],
      starter: `function lengthOfLongestSubstring(s) {
  // Your code here
}`,
      tests: [
        { args: ['abcabcbb'], expected: 3 },
        { args: ['bbbbb'], expected: 1 },
        { args: ['pwwkew'], expected: 3 },
        { args: [''], expected: 0 },
        { args: ['abba'], expected: 2 },
        { args: ['dvdf'], expected: 3 },
      ],
      hints: [
        'Use a sliding window [left, right] that always contains unique characters.',
        'Track the last index where each character was seen (a Map). When you see a repeat inside the window, move `left` past it.',
        'Careful: `left = Math.max(left, lastSeen[ch] + 1)`, because left must never move backwards (see "abba").',
      ],
      solution: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch)) left = Math.max(left, last.get(ch) + 1);
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      complexity: 'O(n) time, O(min(n, alphabet)) space',
    },
    {
      id: 'cc-merge-intervals', title: 'Merge Intervals', difficulty: 2, topic: 'algo', fn: 'merge',
      prompt: 'Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals and return the non-overlapping intervals sorted by start.',
      examples: ['merge([[1,3],[2,6],[8,10],[15,18]]) → [[1,6],[8,10],[15,18]]', 'merge([[1,4],[4,5]]) → [[1,5]]'],
      starter: `function merge(intervals) {
  // Your code here
}`,
      tests: [
        { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
        { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
        { args: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
        { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
        { args: [[[5, 6], [1, 2], [3, 4]]], expected: [[1, 2], [3, 4], [5, 6]] },
      ],
      hints: [
        'Overlaps are easy to spot once intervals are in a particular order. Which one?',
        'Sort by start. Then each interval either overlaps the last merged interval (start <= last end) or starts a new one.',
        'When they overlap, extend: `last[1] = Math.max(last[1], cur[1])`. This handles fully contained intervals like [1,4],[2,3].',
      ],
      solution: `function merge(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [s, e] of sorted) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}`,
      complexity: 'O(n log n) time (sorting), O(n) space',
    },
    {
      id: 'cc-islands', title: 'Number of Islands', difficulty: 2, topic: 'algo', fn: 'numIslands',
      prompt: "Given a 2D grid of `'1'` (land) and `'0'` (water), return the number of islands. An island is formed by connecting adjacent lands **horizontally or vertically**.",
      examples: ['numIslands([["1","1","0"],["0","1","0"],["0","0","1"]]) → 2'],
      starter: `function numIslands(grid) {
  // Your code here
}`,
      tests: [
        { args: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], expected: 1 },
        { args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], expected: 3 },
        { args: [[['0']]], expected: 0 },
        { args: [[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]], expected: 5 },
      ],
      hints: [
        'Scan every cell. When you find unvisited land, you have found a new island. Count it.',
        'Then "sink" the whole island so you never count it again: flood-fill all connected land with DFS or BFS.',
        "DFS from (r, c): if out of bounds or not '1', return; else mark it '0' and recurse into the 4 neighbours.",
      ],
      solution: `function numIslands(grid) {
  const R = grid.length, C = R ? grid[0].length : 0;
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= R || c >= C || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === '1') { count++; sink(r, c); }
  return count;
}`,
      complexity: 'O(R·C) time, O(R·C) worst-case recursion depth',
    },
  ],
};
