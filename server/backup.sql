-- MySQL dump 10.13  Distrib 8.0.32, for macos13 (arm64)
--
-- Host: localhost    Database: stylish
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `story` varchar(255) NOT NULL,
  `picture` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (12,148,'瞬間\r\n在城市的角落\r\n找到失落多時的記憶。\r\n印象《都會故事集》','/assets/201807202140/keyvisual.jpg','2023-05-13 05:03:43','2023-05-13 05:03:43'),(13,153,'永遠\r\n展現自信與專業\r\n無法抵擋的男人魅力。\r\n復古《再一次經典》','/assets/201807242222/keyvisual.jpg','2023-05-13 05:03:43','2023-05-13 05:03:43'),(14,154,'於是\r\n我也想要給你\r\n一個那麼美好的自己。\r\n不朽《與自己和好如初》','/assets/201807242228/keyvisual.jpg','2023-05-13 05:03:43','2023-05-13 05:03:43');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `variant_id` bigint unsigned NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_recipients`
--

DROP TABLE IF EXISTS `order_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_recipients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `name` varchar(127) NOT NULL,
  `phone` varchar(127) NOT NULL,
  `email` varchar(127) NOT NULL,
  `address` varchar(127) NOT NULL,
  `time_preference` enum('morning','afternoon','anytime') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_recipients_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_recipients`
--

LOCK TABLES `order_recipients` WRITE;
/*!40000 ALTER TABLE `order_recipients` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `status` int NOT NULL,
  `number` varchar(127) NOT NULL,
  `shipping` enum('delivery') NOT NULL,
  `payment` enum('credit_card') NOT NULL,
  `subtotal` int NOT NULL,
  `freight` int NOT NULL,
  `total` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number_2` (`number`),
  KEY `user_id` (`user_id`),
  KEY `number` (`number`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mimetype` varchar(127) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `size` int unsigned NOT NULL,
  `field_name` varchar(127) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=432 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (381,147,'201807201824','image/jpeg','201807201824','/assets/201807201824/main.jpg',99656,'main_image'),(382,147,'201807201824','image/jpeg','201807201824','/assets/201807201824/0.jpg',91312,'images'),(383,147,'201807201824','image/jpeg','201807201824','/assets/201807201824/1.jpg',101100,'images'),(384,148,'201807202140','image/jpeg','201807202140','/assets/201807202140/main.jpg',72413,'main_image'),(385,148,'201807202140','image/jpeg','201807202140','/assets/201807202140/0.jpg',101531,'images'),(386,148,'201807202140','image/jpeg','201807202140','/assets/201807202140/1.jpg',70961,'images'),(387,149,'201807202150','image/jpeg','201807202150','/assets/201807202150/main.jpg',83924,'main_image'),(388,149,'201807202150','image/jpeg','201807202150','/assets/201807202150/0.jpg',89403,'images'),(389,149,'201807202150','image/jpeg','201807202150','/assets/201807202150/1.jpg',70713,'images'),(390,150,'201807202157','image/jpeg','201807202157','/assets/201807202157/main.jpg',79161,'main_image'),(391,150,'201807202157','image/jpeg','201807202157','/assets/201807202157/0.jpg',79085,'images'),(392,150,'201807202157','image/jpeg','201807202157','/assets/201807202157/1.jpg',62265,'images'),(393,151,'201807242211','image/jpeg','201807242211','/assets/201807242211/main.jpg',28067,'main_image'),(394,151,'201807242211','image/jpeg','201807242211','/assets/201807242211/0.jpg',66787,'images'),(395,151,'201807242211','image/jpeg','201807242211','/assets/201807242211/1.jpg',24908,'images'),(396,152,'201807242216','image/jpeg','201807242216','/assets/201807242216/main.jpg',148741,'main_image'),(397,152,'201807242216','image/jpeg','201807242216','/assets/201807242216/0.jpg',75669,'images'),(398,152,'201807242216','image/jpeg','201807242216','/assets/201807242216/1.jpg',101787,'images'),(399,153,'201807242222','image/jpeg','201807242222','/assets/201807242222/main.jpg',47469,'main_image'),(400,153,'201807242222','image/jpeg','201807242222','/assets/201807242222/0.jpg',83722,'images'),(401,153,'201807242222','image/jpeg','201807242222','/assets/201807242222/1.jpg',52509,'images'),(402,154,'201807242228','image/jpeg','201807242228','/assets/201807242228/main.jpg',80832,'main_image'),(403,154,'201807242228','image/jpeg','201807242228','/assets/201807242228/0.jpg',90305,'images'),(404,154,'201807242228','image/jpeg','201807242228','/assets/201807242228/1.jpg',92496,'images'),(405,155,'201807242230','image/jpeg','201807242230','/assets/201807242230/main.jpg',73954,'main_image'),(406,155,'201807242230','image/jpeg','201807242230','/assets/201807242230/0.jpg',82139,'images'),(407,155,'201807242230','image/jpeg','201807242230','/assets/201807242230/1.jpg',87711,'images'),(408,156,'201807242232','image/jpeg','201807242232','/assets/201807242232/main.jpg',71490,'main_image'),(409,156,'201807242232','image/jpeg','201807242232','/assets/201807242232/0.jpg',84114,'images'),(410,156,'201807242232','image/jpeg','201807242232','/assets/201807242232/1.jpg',56953,'images'),(411,157,'201807242234','image/jpeg','201807242234','/assets/201807242234/main.jpg',98213,'main_image'),(412,157,'201807242234','image/jpeg','201807242234','/assets/201807242234/0.jpg',114334,'images'),(413,157,'201807242234','image/jpeg','201807242234','/assets/201807242234/1.jpg',97641,'images'),(414,158,'201902191210','image/jpeg','201902191210','/assets/201902191210/main.jpg',99656,'main_image'),(415,158,'201902191210','image/jpeg','201902191210','/assets/201902191210/0.jpg',91312,'images'),(416,158,'201902191210','image/jpeg','201902191210','/assets/201902191210/1.jpg',101100,'images'),(417,159,'201902191242','image/jpeg','201902191242','/assets/201902191242/main.jpg',72413,'main_image'),(418,159,'201902191242','image/jpeg','201902191242','/assets/201902191242/0.jpg',101531,'images'),(419,159,'201902191242','image/jpeg','201902191242','/assets/201902191242/1.jpg',70961,'images'),(420,160,'201902191245','image/jpeg','201902191245','/assets/201902191245/main.jpg',83924,'main_image'),(421,160,'201902191245','image/jpeg','201902191245','/assets/201902191245/0.jpg',89403,'images'),(422,160,'201902191245','image/jpeg','201902191245','/assets/201902191245/1.jpg',70713,'images'),(423,161,'201902191247','image/jpeg','201902191247','/assets/201902191247/main.jpg',79161,'main_image'),(424,161,'201902191247','image/jpeg','201902191247','/assets/201902191247/0.jpg',79085,'images'),(425,161,'201902191247','image/jpeg','201902191247','/assets/201902191247/1.jpg',62265,'images');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `color` varchar(127) NOT NULL,
  `size` enum('S','M','L','XS','XL','F') DEFAULT NULL,
  `stock` int unsigned NOT NULL,
  `color_name` varchar(127) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=405 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (324,147,'#FFFFFF','S',1,'白色'),(325,147,'#FFFFFF','M',1,'白色'),(326,147,'#FFFFFF','L',2,'白色'),(327,147,'#DDFFBB','S',9,'亮綠'),(328,147,'#DDFFBB','M',0,'亮綠'),(329,147,'#DDFFBB','L',5,'亮綠'),(330,147,'#CCCCCC','S',8,'淺灰'),(331,147,'#CCCCCC','M',5,'淺灰'),(332,147,'#CCCCCC','L',9,'淺灰'),(333,148,'#DDFFBB','S',7,'亮綠'),(334,148,'#DDFFBB','M',5,'亮綠'),(335,148,'#DDFFBB','L',8,'亮綠'),(336,148,'#CCCCCC','S',1,'淺灰'),(337,148,'#CCCCCC','M',6,'淺灰'),(338,148,'#CCCCCC','L',2,'淺灰'),(339,149,'#DDFFBB','S',3,'亮綠'),(340,149,'#DDFFBB','M',5,'亮綠'),(341,149,'#CCCCCC','S',4,'淺灰'),(342,149,'#CCCCCC','M',1,'淺灰'),(343,149,'#BB7744','S',2,'淺棕'),(344,149,'#BB7744','M',6,'淺棕'),(345,150,'#DDF0FF','S',8,'淺藍'),(346,150,'#DDF0FF','M',5,'淺藍'),(347,150,'#DDF0FF','L',6,'淺藍'),(348,150,'#CCCCCC','S',0,'淺灰'),(349,150,'#CCCCCC','M',6,'淺灰'),(350,150,'#CCCCCC','L',5,'淺灰'),(351,150,'#334455','S',2,'深藍'),(352,150,'#334455','M',7,'深藍'),(353,150,'#334455','L',9,'深藍'),(354,151,'#FFFFFF','M',5,'白色'),(355,151,'#FFFFFF','L',7,'白色'),(356,151,'#FFFFFF','XL',1,'白色'),(357,151,'#DDF0FF','M',1,'淺藍'),(358,151,'#DDF0FF','L',4,'淺藍'),(359,151,'#DDF0FF','XL',3,'淺藍'),(360,152,'#FFFFFF','S',10,'白色'),(361,152,'#FFFFFF','M',5,'白色'),(362,152,'#FFFFFF','L',6,'白色'),(363,152,'#CCCCCC','S',1,'淺灰'),(364,152,'#CCCCCC','M',3,'淺灰'),(365,152,'#CCCCCC','L',9,'淺灰'),(366,153,'#334455','S',9,'深藍'),(367,153,'#334455','M',5,'深藍'),(368,153,'#334455','L',1,'深藍'),(369,153,'#334455','XL',9,'深藍'),(370,154,'#DDF0FF','M',7,'淺藍'),(371,154,'#DDF0FF','L',1,'淺藍'),(372,154,'#BB7744','M',3,'淺棕'),(373,154,'#BB7744','L',1,'淺棕'),(374,155,'#BB7744','M',5,'淺棕'),(375,155,'#BB7744','L',1,'淺棕'),(376,155,'#334455','M',5,'深藍'),(377,155,'#334455','L',2,'深藍'),(378,156,'#FFFFFF','F',1,'白色'),(379,156,'#FFDDDD','F',1,'粉紅'),(380,157,'#FFFFFF','F',4,'白色'),(381,157,'#DDF0FF','F',7,'淺藍'),(382,158,'#FFFFFF','S',0,'白色'),(383,158,'#FFFFFF','M',9,'白色'),(384,158,'#FFDDDD','S',2,'粉紅'),(385,158,'#FFDDDD','M',1,'粉紅'),(386,159,'#DDFFBB','M',3,'亮綠'),(387,159,'#DDFFBB','L',9,'亮綠'),(388,159,'#DDF0FF','M',2,'淺藍'),(389,159,'#DDF0FF','L',6,'淺藍'),(390,160,'#FFFFFF','M',2,'白色'),(391,160,'#FFFFFF','L',6,'白色'),(392,160,'#CCCCCC','M',5,'淺灰'),(393,160,'#CCCCCC','L',8,'淺灰'),(394,161,'#FFFFFF','S',9,'白色'),(395,161,'#FFFFFF','M',4,'白色'),(396,161,'#FFFFFF','L',2,'白色'),(397,161,'#DDF0FF','S',0,'淺藍'),(398,161,'#DDF0FF','M',10,'淺藍'),(399,161,'#DDF0FF','L',5,'淺藍');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` enum('men','women','accessories') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` int unsigned NOT NULL,
  `texture` varchar(127) NOT NULL,
  `wash` varchar(127) NOT NULL,
  `place` varchar(127) NOT NULL,
  `note` varchar(127) NOT NULL,
  `story` text,
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (147,'women','前開衩扭結洋裝','厚薄：薄\r\n彈性：無',799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(148,'women','透肌澎澎防曬襯衫','厚薄：薄\r\n彈性：無',599,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(149,'women','小扇紋細織上衣','厚薄：薄\r\n彈性：無',599,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(150,'women','活力花紋長筒牛仔褲','厚薄：薄\r\n彈性：無',1299,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(151,'men','純色輕薄百搭襯衫','厚薄：薄\r\n彈性：無',799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(152,'men','時尚輕鬆休閒西裝','厚薄：薄\r\n彈性：無',2399,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(153,'men','經典商務西裝','厚薄：薄\r\n彈性：無',3999,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(154,'accessories','夏日海灘戶外遮陽帽','厚薄：薄\r\n彈性：無',1499,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(155,'accessories','經典牛仔帽','厚薄：薄\r\n彈性：無',799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(156,'accessories','卡哇伊多功能隨身包','厚薄：薄\r\n彈性：無',1299,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(157,'accessories','柔軟氣質羊毛圍巾','厚薄：薄\r\n彈性：無',1799,'棉 100%','手洗，溫水','中國','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(158,'women','精緻扭結洋裝','厚薄：薄\r\n彈性：無',999,'棉 100%','手洗','越南','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(159,'women','透肌澎澎薄紗襯衫','厚薄：薄\r\n彈性：無',999,'棉 100%','手洗','越南','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(160,'women','小扇紋質感上衣','厚薄：薄\r\n彈性：無',999,'棉 100%','手洗','越南','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.'),(161,'women','經典修身長筒牛仔褲','厚薄：薄\r\n彈性：無',1999,'棉 100%','手洗','越南','實品顏色依單品照為主','O.N.S is all about options, which is why we took our staple polo shirt and upgraded it with slubby linen jersey, making it even lighter for those who prefer their summer style extra-breezy.');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_providers`
--

DROP TABLE IF EXISTS `user_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_providers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` enum('native','facebook','google') NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_providers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_providers`
--

LOCK TABLES `user_providers` WRITE;
/*!40000 ALTER TABLE `user_providers` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_providers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(127) NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-18 22:30:18
