<?php

namespace App\Services;

use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Spatie\RobotsTxt\RobotsTxt;
use League\Csv\Reader;

class ScraperService
{
    protected $client;
    protected $userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        // ...add more user agents
    ];
    protected $proxyPool = [
        // 'ip1:port', 'ip2:port', ...
    ];
    protected $botName = 'MyScraperBot';

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 15,
            'connect_timeout' => 10,
        ]);
    }

    public function fetchRobotsTxt(string $baseUrl): ?RobotsTxt
    {
        try {
            $robotsUrl = rtrim($baseUrl, '/') . '/robots.txt';
            $response = $this->client->get($robotsUrl);
            $robotsTxtContent = (string) $response->getBody();
            return RobotsTxt::parse($robotsTxtContent);
        } catch (\Exception $e) {
            Log::warning("Could not fetch robots.txt for $baseUrl: {$e->getMessage()}");
            return null;
        }
    }

    public function isAllowed(string $baseUrl, string $path): bool
    {
        $robots = $this->fetchRobotsTxt($baseUrl);
        if (!$robots) return true; // If can't fetch, default to allow
        return $robots->allows($path, $this->botName);
    }

    public function getCrawlDelay(string $baseUrl): ?int
    {
        $robots = $this->fetchRobotsTxt($baseUrl);
        if (!$robots) return null;
        return $robots->getCrawlDelay($this->botName);
    }

    public function fetchHtml(string $url): ?string
    {
        try {
            $headers = [
                'User-Agent' => $this->userAgents[array_rand($this->userAgents)],
                'Accept' => 'text/html',
            ];
            $options = ['headers' => $headers];
            if (!empty($this->proxyPool)) {
                $options['proxy'] = 'http://' . $this->proxyPool[array_rand($this->proxyPool)];
            }
            $response = $this->client->get($url, $options);
            return (string) $response->getBody();
        } catch (\Exception $e) {
            Log::error("Failed to fetch HTML from $url: {$e->getMessage()}");
            return null;
        }
    }

    public function parseHtml(string $html, callable $parseCallback)
    {
        $crawler = new Crawler($html);
        return $parseCallback($crawler);
    }

    /**
     * Check robots.txt compliance for a given URL and path.
     * Fetches and parses robots.txt, checks if user-agent is allowed,
     * and returns crawl-delay if present.
     *
     * @param string $baseUrl The base URL (e.g., https://example.com)
     * @param string $path The path to check (e.g., /some-page)
     * @return array ['allowed' => bool, 'crawl_delay' => int|null]
     */
    public function checkRobotsCompliance(string $baseUrl, string $path): array
    {
        $robots = $this->fetchRobotsTxt($baseUrl);
        if (!$robots) {
            // If robots.txt can't be fetched, default to allow
            return ['allowed' => true, 'crawl_delay' => null];
        }
        $allowed = $robots->allows($path, $this->botName);
        $crawlDelay = $robots->getCrawlDelay($this->botName);
        return [
            'allowed' => $allowed,
            'crawl_delay' => $crawlDelay
        ];
    }

    /**
     * Throttle requests and enforce per-domain daily rate limits.
     * Returns true if request is allowed, false if limit exceeded.
     * Adds a random delay (3–10 seconds) between requests.
     *
     * @param string $domain The domain (e.g., example.com)
     * @param int $maxRequestsPerDay
     * @return bool
     */
    public function throttleAndCheckRateLimit(string $domain, int $maxRequestsPerDay = 100): bool
    {
        $date = date('Y-m-d');
        $cacheKey = "scraper_requests_{$domain}_{$date}";
        $requests = Cache::get($cacheKey, 0);
        if ($requests >= $maxRequestsPerDay) {
            Log::warning("Daily request limit reached for $domain");
            return false;
        }
        Cache::put($cacheKey, $requests + 1, now()->addHours(24));
        // Add random delay between 3 and 10 seconds
        sleep(random_int(3, 10));
        return true;
    }

    /**
     * Get a random user agent from the pool.
     * @return string
     */
    public function getRandomUserAgent(): string
    {
        return $this->userAgents[array_rand($this->userAgents)];
    }

    /**
     * Get a random proxy from the pool, or null if none set.
     * @return string|null
     */
    public function getRandomProxy(): ?string
    {
        if (empty($this->proxyPool)) {
            return null;
        }
        return $this->proxyPool[array_rand($this->proxyPool)];
    }

    /**
     * Example: Build Guzzle options with random user agent and proxy.
     * @return array
     */
    public function getRequestOptions(): array
    {
        $options = [
            'headers' => [
                'User-Agent' => $this->getRandomUserAgent(),
                'Accept' => 'text/html',
            ]
        ];
        $proxy = $this->getRandomProxy();
        if ($proxy) {
            $options['proxy'] = 'http://' . $proxy;
        }
        return $options;
    }

    /**
     * Detects CAPTCHA in HTML content. If found, pauses scraping for the domain and logs an alert.
     * @param string $html
     * @param string $domain
     * @param int $pauseMinutes
     * @return bool True if CAPTCHA detected, false otherwise
     */
    public function detectAndHandleCaptcha(string $html, string $domain, int $pauseMinutes = 60): bool
    {
        $patterns = [
            '/captcha/i',
            '/recaptcha/i',
            '/g-recaptcha/i',
            '/data-sitekey/i',
            '/class=["\"][^"\"]*captcha[^"\"]*["\"]/i',
            '/id=["\"][^"\"]*captcha[^"\"]*["\"]/i',
            // Add more patterns as needed
        ];
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html)) {
                $cacheKey = "scraper_captcha_pause_{$domain}";
                Cache::put($cacheKey, true, now()->addMinutes($pauseMinutes));
                $this->logCaptchaDetection($domain);
                return true;
            }
        }
        return false;
    }

    /**
     * Check if scraping is currently paused for a domain due to CAPTCHA.
     * @param string $domain
     * @return bool
     */
    public function isCaptchaPauseActive(string $domain): bool
    {
        $cacheKey = "scraper_captcha_pause_{$domain}";
        return Cache::has($cacheKey);
    }

    /**
     * Set a cease & desist flag for a domain (skip all requests to this domain).
     * @param string $domain
     * @param int $hours How long to block (default: 168h = 7 days)
     */
    public function setCeaseAndDesist(string $domain, int $hours = 168): void
    {
        $cacheKey = "scraper_cease_{$domain}";
        Cache::put($cacheKey, true, now()->addHours($hours));
        $this->logCeaseAndDesist($domain);
    }

    /**
     * Check if cease & desist flag is active for a domain.
     * @param string $domain
     * @return bool
     */
    public function isCeaseAndDesistActive(string $domain): bool
    {
        $cacheKey = "scraper_cease_{$domain}";
        return Cache::has($cacheKey);
    }

    /**
     * Cache a response (success or failure) for at least 24 hours.
     * @param string $cacheKey
     * @param mixed $data
     * @param int $hours
     */
    public function cacheResponse(string $cacheKey, $data, int $hours = 24): void
    {
        Cache::put($cacheKey, $data, now()->addHours($hours));
    }

    /**
     * Retrieve a cached response if available.
     * @param string $cacheKey
     * @return mixed|null
     */
    public function getCachedResponse(string $cacheKey)
    {
        return Cache::get($cacheKey);
    }

    /**
     * Ensure only public data is scraped: do not parse content behind paywalls or authentication.
     * This method should be called before parsing HTML.
     * Returns false if the page appears to require login or payment.
     *
     * @param string $html
     * @return bool
     */
    public function isPublicPage(string $html): bool
    {
        $paywallPatterns = [
            '/paywall/i',
            '/subscribe/i',
            '/membership required/i',
            '/login/i',
            '/sign in to view/i',
            '/register to access/i',
            '/premium content/i',
            // Add more as needed
        ];
        foreach ($paywallPatterns as $pattern) {
            if (preg_match($pattern, $html)) {
                Log::warning('Page appears to be behind a paywall or requires authentication. Skipping.');
                return false;
            }
        }
        return true;
    }

    /**
     * Log an error with context.
     * @param string $message
     * @param array $context
     */
    public function logError(string $message, array $context = []): void
    {
        Log::error($message, $context);
    }

    /**
     * Log a CAPTCHA detection event.
     * @param string $domain
     * @param string|null $details
     */
    public function logCaptchaDetection(string $domain, ?string $details = null): void
    {
        Log::alert("CAPTCHA detected for $domain." . ($details ? " Details: $details" : ''));
    }

    /**
     * Log a Cease & Desist event.
     * @param string $domain
     * @param string|null $details
     */
    public function logCeaseAndDesist(string $domain, ?string $details = null): void
    {
        Log::alert("Cease & Desist event for $domain." . ($details ? " Details: $details" : ''));
    }

    /**
     * Parse CNPJ, phone, and email from HTML using Brazilian data formats.
     * @param string $html
     * @return array
     */
    public function extractContactsFromHtml(string $html): array
    {
        $crawler = new Crawler($html);
        $phone = '';
        $email = '';
        $cnpj = null;
        // Try to extract phone number
        if ($crawler->filter('.phone-number')->count()) {
            $phone = $crawler->filter('.phone-number')->text('');
        } elseif (preg_match('/(\(\d{2}\)\s?\d{4,5}\-\d{4})/', $html, $matches)) {
            $phone = $matches[0];
        }
        // Try to extract email
        if ($crawler->filter('a[href^="mailto:"]')->count()) {
            $email = $crawler->filter('a[href^="mailto:"]')->attr('href', '');
        } elseif (preg_match('/[\w\.-]+@[\w\.-]+\.[a-z]{2,}/i', $html, $matches)) {
            $email = $matches[0];
        }
        // Try to extract CNPJ
        if (preg_match('/\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}/', $html, $matches)) {
            $cnpj = $matches[0];
        }
        return [
            'phone' => $phone,
            'email' => $email,
            'cnpj' => $cnpj,
        ];
    }

    /**
     * Example: Scrape resource links from dados.gov.br CNPJ dataset page.
     * @return array
     */
    public function getCnpjResourceLinks(): array
    {
        $url = "https://dados.gov.br/dataset/cnpj";
        $html = $this->fetchHtml($url);
        if (!$html) return [];
        return $this->parseHtml($html, function (Crawler $crawler) {
            return $crawler->filter('a.resource-url-analytics')->each(function (Crawler $node) {
                return $node->attr('href');
            });
        });
    }

    /**
     * Download and parse a large CNPJ CSV dataset from dados.gov.br.
     * @param string $downloadUrl
     * @return array
     */
    public function downloadAndParseCnpjDataset(string $downloadUrl): array
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'cnpj_');
        $this->client->get($downloadUrl, ['sink' => $tempFile]);
        $csv = Reader::createFromPath($tempFile, 'r');
        $csv->setHeaderOffset(0);
        $data = [];
        foreach ($csv as $record) {
            $data[] = [
                'cnpj' => $record['cnpj'] ?? null,
                'company_name' => $record['razao_social'] ?? null,
                'address' => $record['logradouro'] ?? null,
                // ... map other fields as needed
            ];
        }
        unlink($tempFile);
        return $data;
    }

    /**
     * Extract Jucesp business data from HTML.
     * @param string $html
     * @return array
     */
    public function extractJucespData(string $html): array
    {
        $crawler = new Crawler($html);
        return [
            'cnpj' => $crawler->filter('#cnpj')->text(''),
            'legal_representative' => $crawler->filter('.representante')->text(''),
            'address' => $crawler->filter('.endereco')->text(''),
            // ... other fields as needed
        ];
    }

    /**
     * Query Jucesp for a CNPJ and extract business data.
     * @param string $cnpj
     * @return array|null
     */
    public function queryJucesp(string $cnpj): ?array
    {
        $url = "https://www.jucesponline.sp.gov.br/consulta?cnpj={$cnpj}";
        if (!$this->isAllowed("https://www.jucesponline.sp.gov.br", "/consulta")) {
            return null;
        }
        if (!$this->throttleAndCheckRateLimit('jucesponline.sp.gov.br')) {
            return null;
        }
        $html = $this->fetchHtml($url);
        if (!$html || $this->detectAndHandleCaptcha($html, 'jucesponline.sp.gov.br')) {
            return null;
        }
        return $this->extractJucespData($html);
    }
}
