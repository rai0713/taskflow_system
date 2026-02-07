-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2024 at 12:03 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taskflow_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `usraccount_tbl`
--

CREATE TABLE `usraccount_tbl` (
  `AccountID` int(11) NOT NULL,
  `id_no` varchar(20) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `usraccount_tbl`
--

INSERT INTO `usraccount_tbl` (`AccountID`, `id_no`, `Username`, `Password`, `Email`) VALUES
(18, '0', 'krissy07', '$2y$10$EpqidyShzlrGl8R5E2.x8O.BW5H24ShBLqkESp.FGAq', 'password123@gmail.com'),
(19, '0', 'afasfas', '$2y$10$QBFuwKprfk4Hcl.hZpP5.uDtaPU6b96i7gUZvgrdA4f', 'saasfa@gmail.com'),
(22, '0', 'afasfs', '$2y$10$Nem897CUt9T3OSp/LKky1eSCYM0IRfCFrzAqTjfuaeI', 'saassfafa@gmail.com'),
(23, '0', 'jeasfsa', '$2y$10$dYltybJuVw5YlYD.9OS0tOTPTN3GO0E4/Nv4P9Hem3M', 'kriscyruskralp07@gmail.com'),
(24, '0', 'admin', '$2y$10$LfSfaplrvg4jKCq2wZRYr.nogvQgwNsRCX.EPzxrzcx', 'afafsasf@gmail.com'),
(25, '0', 'asfsa', '$2y$10$X0Hk1L0ns4BFJGKiDyOuFeMuA2O9lC9RC1fZKwgKYTn', 'krsafkjals@gmail.com'),
(26, '0', 'sfafasf', '$2y$10$0bvjx8IXA.W9r7XhNxhLuOrP/K3yUSS5eQ10Om81LWt', 'afafwsfafs@gmail.com'),
(27, '0', '', '$2y$10$NFgLRQZubGZQyRPWjA.uHubCktHpt1bJaRGLzZZr4a.', 'jasofs@gmail.com'),
(28, '0', 'as', '$2y$10$SdgJSjrFPSC1qROo.Zae8u9mnwL84TAizPFkhPdlmkt', 'kriscyrusasfg@gmail.com'),
(29, '0', '', '$2y$10$sUx12mNQdBe1EKwQTv68quJ51cqZm3tRgX/zSqtz6Ez', 'kriscyr@csucc.edu.ph'),
(30, '0', 'jester08', '$2y$10$hiYjHckbPQvxFXkKdgfOleRBeovt2b6mkT5o3EWf99a', 'asfefe@gmail.com'),
(31, '0', 'sfwasf', '$2y$10$9wzQuY5EjxnwQpyQdOR3jOJcuHJiN4PgRSYo0VSsYx7', 'asfwas@gmail.com'),
(32, '0', 'asfas', '$2y$10$A62U9P8Im5PhLaKbe4AlR.QBtzdUnWBhsVTNOMn/xaC', 'passwors@gmail.com'),
(33, '0', 'asfasfsa', '$2y$10$C7Vbti1FykXhfEQo7NDPdu9cJOPOdr2dKpAJcbM5J.P', 'af2@gmail.com'),
(34, '0', 'asfs', '$2y$10$nusHiUiGA8ftOTUu.X1RpuVm6A5Wa4qkCJrPuMGZnTk', 'afkajwkw@gmail.com'),
(35, '0', 'asfsas', '$2y$10$fH6ZajiCHvo/baghWBFC6u/RGovZ.Z8ZFV0mc7eyHOZ', 'afkajwskw@gmail.com'),
(36, '12345-67891', 'asfsafa', '$2y$10$VrenFKPSfW/4Oju7enuh9e58Y3jSxd4iSPXWhBEBwgo', 'asfwaa@gmail.com'),
(37, '12345-67891', 'admin123', '$2y$10$VL/vypvOYjKG3StHQm7WEehyolcjmR3FshRTb.LeK.h', 'kriscyrus.alpuerto@csucc.edu.ph'),
(38, '20222-07362', 'kriscyrusalpuerto', '$2y$10$teZ9tDcaU0.uSEACiIdnNuI/rgn7Sp2mKja3W5SgLnr', 'kriscyrus.alpuerto@csucc.edu.ph'),
(39, '20212-07361', 'rai123', '$2y$10$1wzcPJu8aGy6Hm6opgR7eeT6UNYWt5dXJigiVRivD6zylLHrgy4Ue', 'kriscyrusasfg@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `usraddress_tbl`
--

CREATE TABLE `usraddress_tbl` (
  `AddressID` int(11) NOT NULL,
  `AccountID` int(11) NOT NULL,
  `Prk/Barangay` varchar(40) NOT NULL,
  `City/Municipality` varchar(45) NOT NULL,
  `Province` varchar(45) NOT NULL,
  `Country` varchar(50) NOT NULL,
  `Zip Code` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `usraddress_tbl`
--

INSERT INTO `usraddress_tbl` (`AddressID`, `AccountID`, `Prk/Barangay`, `City/Municipality`, `Province`, `Country`, `Zip Code`) VALUES
(3, 18, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(4, 19, 'Nothing', 'Cbadbaran City', 'Manila', 'Philippines', 1000),
(5, 22, 'Nothing', 'Cbadbaran City', 'Manila', 'Philippines', 1000),
(6, 23, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(7, 24, 'Nothing', 'Cabadbaran', 'Manila', 'Philippines', 1000),
(8, 25, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(9, 26, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(10, 27, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(11, 28, 'Nothing', 'Cabadbaran', 'Manila', 'Philippines', 1000),
(12, 29, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(13, 30, 'Nothing', 'Cabadbaran', 'Manila', 'Philippines', 1000),
(14, 31, 'Nothing', 'Cabadbaran', 'Manila', 'Philippines', 1000),
(15, 32, 'Nothing', 'Cabadbaran', 'Manila', 'Philippines', 1000),
(16, 33, 'Nothing', 'Cbadbaran City', 'Manila', 'Philippines', 1000),
(17, 34, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(18, 35, 'Nothing', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(19, 36, 'Nothing', 'Cabadbaran', 'Manila', 'Philippines', 1000),
(20, 37, 'Purok 9', 'Caba', 'Agusan Del Norte', 'Philippines', 1000),
(21, 38, 'Purok 9', 'Cabadbaran City', 'Manila', 'Philippines', 1000),
(22, 39, 'Nothing', 'Cabadbaran City', 'Agusan Del Norte', 'Philippines', 1000);

-- --------------------------------------------------------

--
-- Table structure for table `usrinfo_tbl`
--

CREATE TABLE `usrinfo_tbl` (
  `PersonalInfoID` int(11) NOT NULL,
  `AccountID` int(11) NOT NULL,
  `firstName` varchar(25) NOT NULL,
  `middleName` varchar(25) DEFAULT NULL,
  `lastName` varchar(25) NOT NULL,
  `extName` varchar(5) DEFAULT NULL,
  `sex` enum('Male','Femaie') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `usrinfo_tbl`
--

INSERT INTO `usrinfo_tbl` (`PersonalInfoID`, `AccountID`, `firstName`, `middleName`, `lastName`, `extName`, `sex`) VALUES
(6, 18, 'Kriscyrus', 'Ancero', 'Alpuerto', NULL, 'Male'),
(7, 19, 'Kriscyrus', '', 'Alpuerto', NULL, 'Male'),
(8, 22, 'Kriscyrus', '', 'Alpuerto', '', 'Male'),
(9, 23, 'Kriscyrus', '', 'Alpuerto', '', 'Male'),
(10, 24, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(11, 25, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(12, 26, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(13, 27, 'Kriscyrus', 'Abcehu', 'Alpuerto', 'IV', 'Male'),
(14, 28, 'Kriscyrus', 'Ancero', 'Alpuerto', 'Sr.', 'Male'),
(15, 29, 'Kriscyrus', 'Ancero', 'Alpuerto', 'Sr.', 'Male'),
(16, 30, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(17, 31, 'Kriscyrus', 'Ancero', 'Alpuerto', 'V', 'Male'),
(18, 32, 'Kriscyrus', 'Ssafasf', 'Alpuerto', 'IV', 'Male'),
(19, 33, 'Kriscyrus', 'Ancero', 'Alpuerto', 'V', 'Male'),
(20, 34, 'Kriscyrus', 'Ancero', 'Alpuerto', 'Jr.', 'Male'),
(21, 35, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(22, 36, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(23, 37, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(24, 38, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male'),
(25, 39, 'Kriscyrus', 'Ancero', 'Alpuerto', '', 'Male');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `usraccount_tbl`
--
ALTER TABLE `usraccount_tbl`
  ADD PRIMARY KEY (`AccountID`),
  ADD UNIQUE KEY `Username` (`Username`,`Email`);

--
-- Indexes for table `usraddress_tbl`
--
ALTER TABLE `usraddress_tbl`
  ADD PRIMARY KEY (`AddressID`),
  ADD KEY `usrinfoaddr_FK_2` (`AccountID`);

--
-- Indexes for table `usrinfo_tbl`
--
ALTER TABLE `usrinfo_tbl`
  ADD PRIMARY KEY (`PersonalInfoID`),
  ADD KEY `usrinfo_FK_1` (`AccountID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `usraccount_tbl`
--
ALTER TABLE `usraccount_tbl`
  MODIFY `AccountID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `usraddress_tbl`
--
ALTER TABLE `usraddress_tbl`
  MODIFY `AddressID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `usrinfo_tbl`
--
ALTER TABLE `usrinfo_tbl`
  MODIFY `PersonalInfoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `usraddress_tbl`
--
ALTER TABLE `usraddress_tbl`
  ADD CONSTRAINT `usraddr_FK_2` FOREIGN KEY (`AccountID`) REFERENCES `usraccount_tbl` (`AccountID`);

--
-- Constraints for table `usrinfo_tbl`
--
ALTER TABLE `usrinfo_tbl`
  ADD CONSTRAINT `usrinfo_FK_1` FOREIGN KEY (`AccountID`) REFERENCES `usraccount_tbl` (`AccountID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
