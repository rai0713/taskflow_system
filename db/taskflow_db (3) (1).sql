-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2024 at 11:57 PM
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
(40, '2022-1234', 'super01', '$2y$10$JxHvaFChFaw6Unt2z7.gWeLUW189CSb1Ai1B8yzBZCK5K2kd70AaW', 'jessie.vasquez@gmail.com');

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
(23, 40, 'Purok 9', 'Cabadbaran City', 'Agusan Del Norte', 'Philippines', 1000);

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
  `sex` enum('Male','Femaie') NOT NULL,
  `DOB` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `usrinfo_tbl`
--

INSERT INTO `usrinfo_tbl` (`PersonalInfoID`, `AccountID`, `firstName`, `middleName`, `lastName`, `extName`, `sex`, `DOB`) VALUES
(26, 40, 'Kriscyrus', '', 'Alpuerto', '', 'Male', '2004-07-07');

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
  MODIFY `AccountID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `usraddress_tbl`
--
ALTER TABLE `usraddress_tbl`
  MODIFY `AddressID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `usrinfo_tbl`
--
ALTER TABLE `usrinfo_tbl`
  MODIFY `PersonalInfoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `usraddress_tbl`
--
ALTER TABLE `usraddress_tbl`
  ADD CONSTRAINT `usraddr_FK_2` FOREIGN KEY (`AccountID`) REFERENCES `usraccount_tbl` (`AccountID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usrinfo_tbl`
--
ALTER TABLE `usrinfo_tbl`
  ADD CONSTRAINT `usrinfo_FK_1` FOREIGN KEY (`AccountID`) REFERENCES `usraccount_tbl` (`AccountID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
