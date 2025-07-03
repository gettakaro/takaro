// Real public IP addresses from different countries for realistic GeoIP testing
// These are actual public IPs that will resolve to real countries via GeoIP services

const PUBLIC_IPS_BY_COUNTRY = [
  // United States
  '8.8.8.8', // Google DNS - US
  '1.1.1.1', // Cloudflare - US
  '208.67.222.222', // OpenDNS - US
  '64.6.64.6', // Verisign - US
  '199.85.126.10', // Norton - US
  '4.2.2.2', // Level 3 - US
  '208.78.70.7', // US Internet - US
  '66.6.64.6', // Neustar - US
  '156.154.70.1', // Neustar - US
  '198.6.1.4', // Comcast - US

  // United Kingdom
  '212.58.244.22', // BBC - UK
  '85.158.238.130', // BT - UK
  '194.168.4.100', // Virgin Media - UK
  '195.92.195.94', // Sky - UK
  '212.113.2.0', // TalkTalk - UK
  '195.166.130.2', // EE - UK
  '194.72.0.114', // Three - UK

  // Germany
  '85.214.20.141', // Strato - Germany
  '217.160.0.187', // 1&1 - Germany
  '194.25.2.129', // Deutsche Telekom - Germany
  '195.50.140.246', // Vodafone - Germany
  '212.112.225.31', // O2 - Germany
  '194.8.194.60', // Freenet - Germany
  '62.138.238.178', // Congstar - Germany

  // France
  '80.67.169.12', // Free - France
  '212.27.40.240', // Orange - France
  '193.252.19.3', // OVH - France
  '194.2.0.20', // SFR - France
  '80.10.246.2', // Bouygues - France
  '212.194.93.22', // Numericable - France

  // Netherlands
  '145.131.5.35', // University of Amsterdam - Netherlands
  '194.109.6.66', // XS4ALL - Netherlands
  '213.154.224.1', // KPN - Netherlands
  '195.121.1.34', // Ziggo - Netherlands
  '213.75.112.98', // T-Mobile - Netherlands
  '80.100.192.168', // Online - Netherlands

  // Canada
  '142.103.1.1', // Shaw - Canada
  '205.210.42.205', // Telus - Canada
  '24.222.0.1', // Rogers - Canada
  '207.34.56.2', // Bell - Canada
  '199.7.91.13', // Videotron - Canada
  '64.59.144.22', // Cogeco - Canada

  // Australia
  '203.50.2.71', // Telstra - Australia
  '139.130.4.5', // Australian National University - Australia
  '210.56.23.236', // Optus - Australia
  '203.12.160.35', // TPG - Australia
  '58.6.115.42', // BigPond - Australia
  '203.8.183.1', // iiNet - Australia

  // Japan
  '210.196.3.183', // NTT - Japan
  '133.242.9.183', // University of Tokyo - Japan
  '202.12.27.33', // IIJ - Japan
  '202.32.1.53', // KDDI - Japan
  '210.128.114.18', // SoftBank - Japan
  '157.7.107.46', // OCN - Japan

  // South Korea
  '168.126.63.1', // KT - South Korea
  '203.248.252.2', // LG U+ - South Korea
  '164.124.101.2', // SK Broadband - South Korea
  '210.220.163.82', // Dacom - South Korea
  '203.241.132.34', // Hanaro - South Korea

  // Singapore
  '165.21.83.88', // Singtel - Singapore
  '203.116.122.148', // StarHub - Singapore
  '202.166.205.85', // M1 - Singapore
  '203.109.129.67', // Pacific Internet - Singapore

  // Brazil
  '200.160.2.3', // NET - Brazil
  '200.221.11.100', // Oi - Brazil
  '189.38.95.95', // Telefonica - Brazil
  '200.175.5.139', // Tim - Brazil
  '177.32.140.83', // Claro - Brazil
  '201.6.4.148', // Embratel - Brazil

  // India
  '203.94.227.70', // BSNL - India
  '121.242.190.180', // Airtel - India
  '49.44.208.100', // Jio - India
  '202.83.21.11', // Vodafone - India
  '203.122.58.206', // MTNL - India
  '115.113.165.146', // Idea - India

  // Russia
  '77.88.8.8', // Yandex - Russia
  '195.34.32.116', // Rostelecom - Russia
  '212.188.10.16', // MTS - Russia
  '195.208.4.1', // Beeline - Russia
  '217.118.66.243', // Megafon - Russia
  '91.203.5.146', // TTK - Russia

  // China
  '114.114.114.114', // 114DNS - China
  '223.5.5.5', // AliDNS - China
  '180.76.76.76', // Baidu - China
  '211.136.112.200', // China Mobile - China
  '61.139.2.69', // China Telecom - China
  '123.125.81.6', // China Unicom - China

  // Mexico
  '200.57.7.161', // Telmex - Mexico
  '189.203.1.1', // Totalplay - Mexico
  '200.23.67.15', // Megacable - Mexico
  '200.38.166.130', // Axtel - Mexico
  '201.131.215.74', // Izzi - Mexico

  // Spain
  '194.179.1.100', // Telefonica - Spain
  '80.58.61.250', // Orange - Spain
  '62.81.16.1', // Vodafone - Spain
  '212.166.64.1', // Jazztel - Spain
  '213.0.8.18', // Ono - Spain

  // Italy
  '151.99.125.2', // Wind Tre - Italy
  '212.216.172.62', // TIM - Italy
  '93.57.8.222', // Fastweb - Italy
  '151.38.39.114', // Vodafone - Italy
  '212.26.136.109', // Infostrada - Italy

  // Sweden
  '194.132.32.32', // Telia - Sweden
  '78.67.84.4', // Bahnhof - Sweden
  '195.67.199.26', // Bredbandsbolaget - Sweden
  '130.244.127.161', // Comhem - Sweden
  '213.115.12.90', // Telenor - Sweden

  // Norway
  '129.241.1.99', // NTNU - Norway
  '158.38.48.10', // Telenor - Norway
  '195.159.0.50', // NextGenTel - Norway
  '85.18.11.128', // Get - Norway
  '194.248.220.30', // Altibox - Norway

  // South Africa
  '196.25.1.1', // Telkom - South Africa
  '197.189.206.1', // MTN - South Africa
  '41.203.245.1', // Vodacom - South Africa
  '165.255.92.1', // Cell C - South Africa
  '196.43.46.190', // SAIX - South Africa

  // Egypt
  '196.218.123.1', // TE Data - Egypt
  '41.187.15.198', // Vodafone - Egypt
  '197.162.128.1', // Orange - Egypt
  '196.175.76.1', // Etisalat - Egypt

  // Turkey
  '195.175.39.39', // Turk Telekom - Turkey
  '212.252.157.5', // Vodafone - Turkey
  '88.247.17.10', // Turkcell - Turkey
  '85.97.224.19', // TTNET - Turkey

  // Greece
  '194.219.231.33', // OTE - Greece
  '212.205.16.19', // Forthnet - Greece
  '195.170.0.1', // Wind - Greece
  '62.169.254.78', // Vodafone - Greece

  // Poland
  '212.77.98.9', // Orange - Poland
  '195.187.6.33', // TP - Poland
  '89.67.211.178', // Play - Poland
  '212.2.96.17', // Plus - Poland

  // Czech Republic
  '195.113.144.194', // O2 - Czech Republic
  '213.151.193.252', // T-Mobile - Czech Republic
  '88.146.224.63', // Vodafone - Czech Republic
  '195.178.64.7', // UPC - Czech Republic

  // Finland
  '194.100.2.2', // Elisa - Finland
  '195.197.54.74', // Telia - Finland
  '195.74.0.47', // DNA - Finland
  '213.138.109.130', // Sonera - Finland

  // Denmark
  '130.226.1.1', // TDC - Denmark
  '195.184.76.26', // Telia - Denmark
  '212.66.0.1', // 3 - Denmark
  '194.239.134.83', // Telenor - Denmark

  // Belgium
  '195.238.2.21', // Belgacom - Belgium
  '195.130.130.5', // Telenet - Belgium
  '212.71.8.10', // Mobistar - Belgium
  '193.74.208.65', // Voo - Belgium

  // Switzerland
  '195.186.1.111', // Swisscom - Switzerland
  '62.2.17.61', // UPC - Switzerland
  '195.176.96.96', // Sunrise - Switzerland
  '212.147.0.3', // Green - Switzerland

  // Austria
  '194.48.124.202', // A1 - Austria
  '195.3.96.67', // UPC - Austria
  '213.162.69.169', // T-Mobile - Austria
  '212.25.1.1', // Tele2 - Austria

  // Argentina
  '200.45.191.172', // Telecom - Argentina
  '181.171.144.14', // Arnet - Argentina
  '200.51.211.183', // Speedy - Argentina
  '200.32.96.68', // Fibertel - Argentina

  // Chile
  '200.27.1.1', // VTR - Chile
  '200.104.240.41', // Entel - Chile
  '190.98.248.254', // Movistar - Chile
  '200.14.193.20', // GTD - Chile

  // Colombia
  '181.129.183.19', // ETB - Colombia
  '200.75.51.132', // UNE - Colombia
  '190.90.160.172', // Claro - Colombia
  '181.78.23.135', // Movistar - Colombia

  // Peru
  '200.48.225.130', // Telefonica - Peru
  '200.37.158.4', // Claro - Peru
  '181.176.211.85', // Entel - Peru

  // Venezuela
  '200.44.32.12', // CANTV - Venezuela
  '190.74.143.13', // Movistar - Venezuela
  '200.109.148.69', // Digitel - Venezuela

  // Thailand
  '203.154.83.106', // True - Thailand
  '202.129.97.93', // AIS - Thailand
  '203.113.130.10', // TOT - Thailand
  '202.129.224.69', // CAT - Thailand

  // Vietnam
  '203.162.4.191', // VNPT - Vietnam
  '210.245.31.130', // Viettel - Vietnam
  '118.69.111.222', // FPT - Vietnam

  // Malaysia
  '202.188.0.133', // TM - Malaysia
  '202.75.191.166', // Maxis - Malaysia
  '203.92.1.4', // DiGi - Malaysia
  '115.164.12.116', // Celcom - Malaysia

  // Indonesia
  '202.134.1.10', // Telkom - Indonesia
  '203.130.193.74', // Indosat - Indonesia
  '202.152.240.50', // XL - Indonesia

  // Philippines
  '203.177.11.220', // PLDT - Philippines
  '210.213.58.15', // Globe - Philippines
  '202.90.136.10', // Smart - Philippines

  // Israel
  '212.150.2.54', // Bezeq - Israel
  '194.90.1.5', // Orange - Israel
  '212.179.96.11', // Cellcom - Israel

  // UAE
  '213.42.20.20', // Etisalat - UAE
  '195.229.241.222', // Du - UAE

  // Saudi Arabia
  '212.26.128.1', // STC - Saudi Arabia
  '212.12.96.67', // Mobily - Saudi Arabia
  '85.229.0.1', // Zain - Saudi Arabia
];

export function getRandomPublicIP(): string {
  const randomIndex = Math.floor(Math.random() * PUBLIC_IPS_BY_COUNTRY.length);
  return PUBLIC_IPS_BY_COUNTRY[randomIndex];
}
