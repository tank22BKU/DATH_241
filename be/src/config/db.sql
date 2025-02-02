-- Bảng `User`
CREATE TABLE IF NOT EXISTS `User` (
    `user_ID` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255),
    `role` ENUM('student', 'spso') NOT NULL,
    `pageBalance` INT DEFAULT 0
);

-- Bảng `FileType`
CREATE TABLE IF NOT EXISTS `FileType` (
    `type` VARCHAR(50) PRIMARY KEY,
    `spso_ID` INT,
    FOREIGN KEY (`spso_ID`) REFERENCES `User`(`user_ID`) ON DELETE SET NULL
);

-- Bảng `AutoPaper`
CREATE TABLE IF NOT EXISTS `AutoPaper` (
    `semester` VARCHAR(50) PRIMARY KEY,
    `number` INT NOT NULL,
    `scheduler` DATETIME,
    `spso_ID` INT,
    FOREIGN KEY (`spso_ID`) REFERENCES `User`(`user_ID`) ON DELETE SET NULL
);

-- -- Bảng `Location`
-- CREATE TABLE IF NOT EXISTS `Location` (
--     `location_ID` INT PRIMARY KEY AUTO_INCREMENT,
--     `campus` VARCHAR(255),
--     `building` VARCHAR(255),
--     `room` VARCHAR(50)
-- );

-- -- Bảng `Printer`
-- CREATE TABLE IF NOT EXISTS `Printer` (
--     `Printer_ID` INT PRIMARY KEY AUTO_INCREMENT,
--     `branchName` VARCHAR(255),
--     `model` VARCHAR(255),
--     `description` TEXT,
--     `status` ENUM('enable', 'disable') DEFAULT 'enable',
--     `loc_ID` INT,
--     FOREIGN KEY (`loc_ID`) REFERENCES `Location`(`location_ID`) ON DELETE SET NULL
-- );

-- Bảng `Location`
CREATE TABLE IF NOT EXISTS `Location` (
    `location_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `building` VARCHAR(255)
);

-- Bảng `Printer`
CREATE TABLE IF NOT EXISTS `Printer` (
    `Printer_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `branchName` VARCHAR(255),
    `model` VARCHAR(255),
    `description` TEXT,
    `status` ENUM('enable', 'disable') DEFAULT 'enable',
    `loc_ID` INT,
    `weight` VARCHAR(255),
    `printer_type` VARCHAR(255),  -- For example: "In laser trắng đen"
    `queue` INT,                  -- Number of jobs in queue
    `prints_in_day` INT,          -- Number of prints in a day
    `pages_printed` INT,          -- Total pages printed
    `printer_size`  VARCHAR(255),
    `color_print` ENUM('yes', 'no'), -- Whether the printer supports color printing
    `paper_size` VARCHAR(255),    -- Supported paper sizes (e.g., "A4, A5, Legal, Letter")
    `resolution` VARCHAR(50),     -- Printer resolution (e.g., "600x600 dpi")
    `ink_type` VARCHAR(255),      -- Ink type (e.g., "Canon XO 652152-X")
    FOREIGN KEY (`loc_ID`) REFERENCES `Location`(`location_ID`) ON DELETE SET NULL
);

-- Bảng `PrintConfiguration`
CREATE TABLE IF NOT EXISTS `PrintConfiguration` (
    `config_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `printStart` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `printEnd` DATETIME,
    `user_ID` INT,
    `printer_ID` INT,
    `numPages` INT DEFAULT 0,
    `numCopies` INT DEFAULT 1,
    `paperSize` VARCHAR(50),
    `printSide` VARCHAR(50),
    `orientation` VARCHAR(50),
    `status` VARCHAR(50) DEFAULT 'unCompleted',
    FOREIGN KEY (`user_ID`) REFERENCES `User`(`user_ID`) ON DELETE SET NULL,
    FOREIGN KEY (`printer_ID`) REFERENCES `Printer`(`Printer_ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `Document`
CREATE TABLE IF NOT EXISTS `Document` (
    `config_ID` INT,
    `name` VARCHAR(255) NOT NULL,
    `size` INT NOT NULL,
    `lastModifiedDate` DATETIME NOT NULL,
    PRIMARY KEY (`config_ID`, `name`),
    FOREIGN KEY (`config_ID`) REFERENCES `PrintConfiguration`(`config_ID`) ON DELETE CASCADE
);

-- Bảng `Properties`
CREATE TABLE IF NOT EXISTS `Properties` (
    `config_ID` INT PRIMARY KEY,
    `pageSize` ENUM('A4', 'A3') DEFAULT 'A4',
    `noCopy` INT DEFAULT 1,
    `noPage` INT,
    `startPage` INT,
    `endPage` INT,
    `scale` INT DEFAULT 100,
    `isDuplex` ENUM( '1', '2') DEFAULT '1',
    `orientation` ENUM( 'Dọc', 'Ngang') DEFAULT 'Dọc',
    FOREIGN KEY (`config_ID`) REFERENCES `PrintConfiguration`(`config_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `Orders`
CREATE TABLE IF NOT EXISTS `Orders` (
    `order_ID` INT AUTO_INCREMENT PRIMARY KEY,
    `user_ID` INT,
    `quantityPaper` INT DEFAULT 0,
    `quantityPackage1` INT DEFAULT 0,
    `quantityPackage2` INT DEFAULT 0,
    `quantityPackage3` INT DEFAULT 0,
    `totalCost` DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    `dateOrder` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `datePaid` DATE DEFAULT NULL,
    `status` ENUM('chưa thanh toán', 'đã thanh toán') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chưa thanh toán',
    FOREIGN KEY (`user_ID`) REFERENCES `User`(`user_ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Bảng `Paper_Package`
CREATE TABLE IF NOT EXISTS `Paper_Package` (
    `pp_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL,
    `price` INT NOT NULL
);

-- Bảng `Order_Package`
CREATE TABLE IF NOT EXISTS `Order_Package` (
    `order_ID` INT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `price` INT NOT NULL,
    `originalPrice` INT NOT NULL,
    `discount` INT NOT NULL,
    PRIMARY KEY (`order_ID`, `description`),
    FOREIGN KEY (`order_ID`) REFERENCES `Orders`(`order_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `Notification_Message`
CREATE TABLE IF NOT EXISTS `Notification_Message` (
    `notification_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `createDate` DATETIME DEFAULT CURRENT_TIMESTAMP,    -- Ngày tạo
    `updateDate` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    `title` VARCHAR(255) NOT NULL, -- Tiêu đề của thông báo
    `content` TEXT NOT NULL        -- Nội dung thông báo
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `Receiver_Message` (liên kết thông báo với người nhận)
CREATE TABLE IF NOT EXISTS `Receiver_Message` (
    `notification_ID` INT NOT NULL,   -- ID của thông báo
    `user_ID` INT NOT NULL,           -- ID của người nhận
    `status` ENUM('unread', 'read') DEFAULT 'unread',  -- Trạng thái thông báo
    PRIMARY KEY (`notification_ID`, `user_ID`),       -- Khóa chính gồm cả notification_ID và user_ID
    FOREIGN KEY (`notification_ID`) REFERENCES `Notification_Message`(`notification_ID`) ON DELETE CASCADE,  -- Ràng buộc khóa ngoại
    FOREIGN KEY (`user_ID`) REFERENCES `User`(`user_ID`) ON DELETE CASCADE -- Ràng buộc khóa ngoại
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* Adding Huynh Message */
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` INT NOT NULL,
    `receiver_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('sent', 'read') DEFAULT 'sent',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_ID`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_id`) REFERENCES `User`(`user_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;









