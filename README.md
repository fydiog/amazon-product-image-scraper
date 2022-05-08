# amazon-product-image-scraper
Given an URL, this script will automatically download the main image for all variants of a product. Uses Node libraries Puppeteer and Axios.

## Installation

Clone this repo and perform a clean install of dependencies using `npm install`
Create a folder called `/images` in case the program does not do it.

## Description 
If you are too lazy to download every single product image manually you have come to the right place.
Just change `const URL_TO_DOWNLOAD = 'url'` to your desired URL and run `node scraper.js`
