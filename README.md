## Commands utilized

php artisan make:migration create_clients_table --create=clients

php artisan make:model Client

php artisan make:command ImportClientsFromCSV

php artisan app:import-clients-from-c-s-v

php artisan make:controller ClientController

composer require guzzlehttp/guzzle      # HTTP requests
composer require symfony/dom-crawler    # Parse HTML
composer require illuminate/cache       # Caching (if not included)

composer require tomzx/robots-txt

composer require spatie/robots-txt
composer require league/csv