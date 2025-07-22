<?php

namespace App\Services;

use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Spatie\RobotsTxt\RobotsTxt;

class ScraperService
{
    // --- Contact Extraction Methods ---
    public function extractContactsFromHtml(string $html): array
    {
        $crawler = new Crawler($html);
        $phone = '';
        $email = '';
        $cnpj = null;
        if ($crawler->filter('.phone-number')->count()) {
            $phone = $crawler->filter('.phone-number')->text('');
        } elseif (preg_match('/(\(\d{2}\)\s?\d{4,5}\-\d{4})/', $html, $matches)) {
            $phone = $matches[0];
        }
        if ($crawler->filter('a[href^="mailto:"]')->count()) {
            $email = $crawler->filter('a[href^="mailto:"]')->attr('href', '');
            $email = str_replace('mailto:', '', $email);
        } elseif (preg_match('/[\w\.-]+@[\w\.-]+\.[a-z]{2,}/i', $html, $matches)) {
            $email = $matches[0];
        }
        if (preg_match('/\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}/', $html, $matches)) {
            $cnpj = $matches[0];
        }
        return [
            'phone' => $phone,
            'email' => $email,
            'cnpj' => $cnpj,
        ];
    }

    private function extractPhoneFromHtml(string $html): string
    {
        if (preg_match('/(\(\d{2}\)\s?\d{4,5}\-\d{4})/', $html, $matches)) {
            return $matches[0];
        }
        return '';
    }

    private function extractEmailFromHtml(string $html): string
    {
        if (preg_match('/[\w\.-]+@[\w\.-]+\.[a-z]{2,}/i', $html, $matches)) {
            return $matches[0];
        }
        return '';
    }

    // --- Proxy Methods ---
    public function fetchFreeProxies(): array
    {
        $sources = [
            'https://www.sslproxies.org/',
            'https://free-proxy-list.net/',
            'https://www.us-proxy.org/',
            'https://www.proxy-list.download/HTTP',
            'https://proxyscrape.com/free-proxy-list'
        ];
        $proxies = [];
        foreach ($sources as $url) {
            try {
                $html = $this->fetchHtmlDirect($url);
                if (!$html) continue;
                $crawler = new Crawler($html);
                $crawler->filter('table tbody tr')->each(function (Crawler $row) use (&$proxies) {
                    $ip = $row->filter('td:nth-child(1)')->text('');
                    $port = $row->filter('td:nth-child(2)')->text('');
                    if (filter_var($ip, FILTER_VALIDATE_IP)) {
                        $proxies[] = $ip . ':' . $port;
                    }
                });
            } catch (\Exception $e) {
                Log::warning("Proxy source failed: $url - {$e->getMessage()}");
            }
        }
        return array_unique($proxies);
    }

    public function fetchApiProxies(): array
    {
        $apis = [
            'https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc',
            'https://www.proxy-list.download/api/v1/get?type=http'
        ];
        $proxies = [];
        foreach ($apis as $url) {
            try {
                $response = $this->fetchHtmlDirect($url);
                if (!$response) continue;
                if ($data = json_decode($response, true)) {
                    if (isset($data['data'])) {
                        foreach ($data['data'] as $proxy) {
                            $proxies[] = $proxy['ip'] . ':' . $proxy['port'];
                        }
                    } elseif (isset($data[0]['ip'])) {
                        foreach ($data as $proxy) {
                            $proxies[] = $proxy['ip'] . ':' . $proxy['port'];
                        }
                    }
                } else {
                    $lines = explode("\n", trim($response));
                    foreach ($lines as $line) {
                        if (str_contains($line, ':')) {
                            $proxies[] = trim($line);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Proxy API failed: $url - {$e->getMessage()}");
            }
        }
        return array_unique($proxies);
    }

    public function testProxies(array $proxies): array
    {
        $workingProxies = [];
        $testUrl = 'https://www.jucesponline.sp.gov.br/';
        $maxToTest = 20;
        $tested = 0;
        foreach ($proxies as $proxy) {
            if ($tested >= $maxToTest) break;
            try {
                $client = new Client([
                    'timeout' => 3,
                    'connect_timeout' => 3,
                    'proxy' => 'http://' . $proxy
                ]);
                $response = $client->get($testUrl, [
                    'headers' => ['User-Agent' => $this->getRandomUserAgent()]
                ]);
                if ($response->getStatusCode() === 200) {
                    $workingProxies[] = $proxy;
                    Log::info("Valid proxy: $proxy");
                }
            } catch (\Exception $e) {
                // Proxy failed - skip it
            }
            $tested++;
            usleep(100000);
        }
        return $workingProxies;
    }

    public function refreshProxyPool(): void
    {
        $this->proxyPool = [];
        $scrapedProxies = $this->fetchFreeProxies();
        $apiProxies = $this->fetchApiProxies();
        $allProxies = array_unique(array_merge($scrapedProxies, $apiProxies));
        $workingProxies = $this->testProxies($allProxies);
        $this->proxyPool = $workingProxies;
        Cache::put('proxy_pool', $this->proxyPool, now()->addHours(6));
        Log::info("Proxy pool refreshed. Working proxies: " . count($this->proxyPool));
    }

    public function getRandomProxy(): ?string
    {
        return null; // Proxy is disabled; always return null
    }

    // --- Robots.txt Methods ---
    public function fetchRobotsTxt(string $baseUrl): ?RobotsTxt
    {
        $host = parse_url($baseUrl, PHP_URL_HOST);
        $cacheKey = 'robots_txt_' . $host;
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }
        try {
            $robotsUrl = rtrim($baseUrl, '/') . '/robots.txt';
            $response = $this->client->get($robotsUrl);
            $robotsTxtContent = (string) $response->getBody();
            $robots = RobotsTxt::parse($robotsTxtContent);
            Cache::put($cacheKey, $robots, now()->addHours(3));
            return $robots;
        } catch (\Exception $e) {
            Log::warning("Could not fetch robots.txt for $baseUrl: {$e->getMessage()}");
            return null;
        }
    }

    public function isAllowed(string $baseUrl, string $path): bool
    {
        $robots = $this->fetchRobotsTxt($baseUrl);
        if (!$robots) return true;
        return $robots->allows($path, $this->botName);
    }

    public function getCrawlDelay(string $baseUrl): ?int
    {
        $robots = $this->fetchRobotsTxt($baseUrl);
        if (!$robots) return null;
        return $robots->getCrawlDelay($this->botName);
    }

    public function checkRobotsCompliance(string $baseUrl, string $path): array
    {
        $robots = $this->fetchRobotsTxt($baseUrl);
        if (!$robots) {
            return ['allowed' => true, 'crawl_delay' => null];
        }
        $allowed = $robots->allows($path, $this->botName);
        $crawlDelay = $robots->getCrawlDelay($this->botName);
        return [
            'allowed' => $allowed,
            'crawl_delay' => $crawlDelay
        ];
    }

    // --- Captcha Methods ---
    public function detectAndHandleCaptcha(string $html, string $domain, int $pauseMinutes = 120): bool
    {
        $patterns = [
            '/captcha/i',
            '/recaptcha/i',
            '/g-recaptcha/i',
            '/data-sitekey/i',
            '/class=["\"][^"\"]*captcha[^"\"]*["\"]/i',
            '/id=["\"][^"\"]*captcha[^"\"]*["\"]/i',
            '/acesso negado/i',
            '/bloqueado/i',
            '/suspicious activity/i',
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

    public function isCaptchaPauseActive(string $domain): bool
    {
        $cacheKey = "scraper_captcha_pause_{$domain}";
        return Cache::has($cacheKey);
    }

    public function setCeaseAndDesist(string $domain, int $hours = 168): void
    {
        $cacheKey = "scraper_cease_{$domain}";
        Cache::put($cacheKey, true, now()->addHours($hours));
        $this->logCeaseAndDesist($domain);
    }

    public function isCeaseAndDesistActive(string $domain): bool
    {
        $cacheKey = "scraper_cease_{$domain}";
        return Cache::has($cacheKey);
    }

    public function logCaptchaDetection(string $domain, ?string $details = null): void
    {
        Log::alert("CAPTCHA detected for $domain." . ($details ? " Details: $details" : ''));
    }

    public function logCeaseAndDesist(string $domain, ?string $details = null): void
    {
        Log::alert("Cease & Desist event for $domain." . ($details ? " Details: $details" : ''));
    }

    // --- Jucesp Methods ---
    public function extractJucespData(string $html): array
    {
        $crawler = new Crawler($html);
        $data = [];
        $cnpjElements = ['#cnpj', '#txtCnpj', '.cnpj', '.documento'];
        foreach ($cnpjElements as $selector) {
            if ($crawler->filter($selector)->count() > 0) {
                $data['cnpj'] = $crawler->filter($selector)->text('');
                break;
            }
        }
        $repElements = ['.representante-legal', '#representante', '.responsavel', '#txtNome'];
        foreach ($repElements as $selector) {
            if ($crawler->filter($selector)->count() > 0) {
                $data['legal_representative'] = $crawler->filter($selector)->text('');
                break;
            }
        }
        $addressElements = [
            '#txtLogradouro', '#txtNumero', '#txtComplemento', '#txtBairro', '#txtMunicipio', '#txtUF', '#txtCEP'
        ];
        $addressParts = [];
        foreach ($addressElements as $selector) {
            if ($crawler->filter($selector)->count() > 0) {
                $value = trim($crawler->filter($selector)->text(''));
                if (!empty($value)) {
                    $addressParts[] = $value;
                }
            }
        }
        $data['address'] = implode(', ', $addressParts);
        $contactSection = $crawler->filter('.contato, .contact-info, #contatos');
        if ($contactSection->count() > 0) {
            $data['phone'] = $contactSection->filter('a[href^="tel:"]')->text('');
            $data['email'] = $contactSection->filter('a[href^="mailto:"]')->text('');
        } else {
            $data['phone'] = $this->extractPhoneFromHtml($html);
            $data['email'] = $this->extractEmailFromHtml($html);
        }
        return $data;
    }

    public function queryJucesp(string $cnpj): ?array
    {
        $domain = 'jucesponline.sp.gov.br';
        $baseUrl = "https://{$domain}";
        $path = "/consulta";
        if ($this->isCaptchaPauseActive($domain)) {
            Log::warning("Skipping $domain due to active CAPTCHA pause");
            return null;
        }
        $robots = $this->fetchRobotsTxt($baseUrl);
        $crawlDelay = $robots ? $robots->getCrawlDelay($this->botName) : null;
        if (!$this->isAllowed($baseUrl, $path)) {
            Log::warning("Blocked by robots.txt for URL: {$baseUrl}{$path}");
            return null;
        }
        if (!$this->throttleAndCheckRateLimit($domain, 50, $crawlDelay)) {
            return null;
        }
        $session = $this->createSession();
        $session->get($baseUrl);
        $url = "{$baseUrl}/consulta?cnpj={$cnpj}";
        $response = $session->get($url);
        $html = (string) $response->getBody();
        if ($this->detectAndHandleCaptcha($html, $domain)) {
            Log::warning("CAPTCHA detected on $domain for CNPJ: $cnpj");
            return null;
        }
        if (!$this->isPublicPage($html)) {
            Log::warning("Page requires authentication or has paywall for CNPJ: $cnpj");
            return null;
        }
        return $this->extractJucespData($html);
    }

    protected $client;
    protected $userAgents = [
        // Android and iOS mobile user agents (for mobile scraping)
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.8759.1483 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10.0.0; SM-N960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.118 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 14.0.0; SM-G996U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.163 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.8114.1381 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.4444.1080 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.7867.1153 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.1912.1288 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.2058.1736 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.1477.1566 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.9208.1965 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0.0; SM-J737T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.46 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.5791.1658 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2965.1202 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.3936.1589 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.5052.1116 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.3861.1102 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.6162.1345 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.7756.1587 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.8324.1585 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.1065.1853 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 14; SM-A336E/DSN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12.0.0; DE2118) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.121 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 RenderZRNApp-android X-React-Native-Version-2 X-RenderZ-App-Version-5.3.0 X-RenderZ-Device-Id-f1ea71bd7ba69a1f X-Safe-Area-Insets-{"left":0,"bottom":0,"right":0,"top":0}',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2991.1319 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10.0.0; SM-N960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5414.118 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.4550.1404 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.3702.1306 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.1500.1856 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 RenderZRNApp-android X-React-Native-Version-2 X-RenderZ-App-Version-5.3.0 X-RenderZ-Device-Id-6a544c6f8c2695d3 X-Safe-Area-Insets-{"left":0,"bottom":0,"right":0,"top":0}',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.7465.1514 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.1151.1136 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; moto e22 Build/SOW32.121-8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.125 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.7752.1083 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2752.1613 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.9461.1878 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Cricket 4) AppleWebKit/528.74 (KHTML, like Gecko) Chrome/102.45.0.0 Mobile Safari/528.74 9fca1455-2086-4441-910c-970976990fb9',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.5057.1199 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.7687.1547 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.1884.1367 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.3074.1845 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.3270.1766 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.6694.1808 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 14.0.0; U572AC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.7151.116 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.9660.1486 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.9814.1787 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.6819.1216 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2127.1115 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2913.1392 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.9786.1395 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.1498.1184 Mobile Safari/537.36',
    ];
    // Proxy pool is disabled for now; scraping will use your own IP only
    protected $proxyPool = [];
    protected $botName = 'MyScraperBot';

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 15,
            'connect_timeout' => 10,
        ]);
        // Proxy pool is disabled; always use your own IP
        $this->proxyPool = [];
    }


    /**
     * Fetch HTML without using proxies (to avoid recursion).
     */
    private function fetchHtmlDirect(string $url): ?string
    {
        try {
            $client = new Client(['timeout' => 10]);
            $response = $client->get($url);
            return (string) $response->getBody();
        } catch (\Exception $e) {
            return null;
        }
    }

    public function fetchHtml(string $url): ?string
    {
        try {
            $headers = [
                'User-Agent' => $this->userAgents[array_rand($this->userAgents)],
                'Accept' => 'text/html',
            ];
            $options = ['headers' => $headers];
            // Proxy is disabled; use your own IP only
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
     * Get a random user agent from the pool.
     * @return string
     */
    public function getRandomUserAgent(): string
    {
        return $this->userAgents[array_rand($this->userAgents)];
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
        // Proxy is disabled; do not set proxy
        return $options;
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
     * Create a Guzzle session with proper headers and settings
     */
    private function createSession(): Client
    {
        return new Client([
            'cookies' => true, // Enable cookie handling
            'timeout' => 20,
            'connect_timeout' => 15,
            'headers' => [
                'User-Agent' => $this->getRandomUserAgent(),
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language' => 'pt-BR,pt;q=0.9,en;q=0.8',
                'Connection' => 'keep-alive',
            ],
            // Proxy is disabled; use your own IP only
        ]);
    }
}
