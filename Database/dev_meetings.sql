-- ---------------------------------------------------------
-- Database export for the "Dev Teams Meetings" system
-- Compatible with both MySQL and MariaDB
-- Uses DEFAULT CHARSET=utf8mb4 WITHOUT a MySQL-8-only collation
-- (utf8mb4_0900_ai_ci) so it imports cleanly on MariaDB too.
-- ---------------------------------------------------------

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dev_meetings`
--
CREATE DATABASE IF NOT EXISTS `dev_meetings` DEFAULT CHARACTER SET utf8mb4;
USE `dev_meetings`;

-- --------------------------------------------------------

--
-- Table structure for table `dev_teams`
--
DROP TABLE IF EXISTS `meetings`;
DROP TABLE IF EXISTS `dev_teams`;

CREATE TABLE `dev_teams` (
  `code` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `dev_teams`
--
INSERT INTO `dev_teams` (`code`, `name`) VALUES
(1, 'UI Team'),
(2, 'Mobile Team'),
(3, 'React Team'),
(4, 'Backend Team'),
(5, 'DevOps Team'),
(6, 'QA Team');

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--
CREATE TABLE `meetings` (
  `code` int NOT NULL AUTO_INCREMENT,
  `dev_team_code` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `description` text NOT NULL,
  `room` varchar(255) NOT NULL,
  PRIMARY KEY (`code`),
  KEY `fk_meetings_dev_team` (`dev_team_code`),
  CONSTRAINT `fk_meetings_dev_team` FOREIGN KEY (`dev_team_code`) REFERENCES `dev_teams` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `meetings`
-- A mix of PAST and FUTURE meetings relative to June 2026.
--
INSERT INTO `meetings` (`code`, `dev_team_code`, `start_time`, `end_time`, `description`, `room`) VALUES
-- Past meetings
(1, 1, '2026-05-04 10:00:00', '2026-05-04 11:30:00', 'UI Team weekly sync: reviewing the new design system components and accessibility guidelines.', 'Blue Room'),
(2, 1, '2026-05-18 14:00:00', '2026-05-18 15:00:00', 'Retrospective for the dashboard redesign sprint.', 'New York Room'),
(3, 2, '2026-05-11 09:30:00', '2026-05-11 10:15:00', 'Mobile Team standup and release planning for the iOS build.', 'Large Board Room'),
(4, 3, '2026-05-26 13:00:00', '2026-05-26 14:30:00', 'React Team deep dive into state management and migration to the new router.', 'Blue Room'),
(5, 4, '2026-06-01 11:00:00', '2026-06-01 12:00:00', 'Backend Team API contract review for the meetings service.', 'New York Room'),
(6, 5, '2026-06-05 16:00:00', '2026-06-05 17:00:00', 'DevOps Team incident review and CI/CD pipeline improvements.', 'Large Board Room'),
-- Future meetings
(7, 1, '2026-06-22 10:00:00', '2026-06-22 11:00:00', 'UI Team kickoff for the marketing site refresh.', 'Blue Room'),
(8, 2, '2026-06-25 09:00:00', '2026-06-25 10:30:00', 'Mobile Team grooming session for the next release cycle.', 'New York Room'),
(9, 3, '2026-07-02 14:00:00', '2026-07-02 15:30:00', 'React Team architecture review for the component library v2.', 'Large Board Room'),
(10, 4, '2026-07-08 13:30:00', '2026-07-08 14:30:00', 'Backend Team database schema planning for analytics.', 'Blue Room'),
(11, 5, '2026-07-15 15:00:00', '2026-07-15 16:00:00', 'DevOps Team cloud cost optimization workshop.', 'New York Room'),
(12, 6, '2026-07-20 11:00:00', '2026-07-20 12:30:00', 'QA Team test automation strategy and tooling evaluation.', 'Large Board Room');
