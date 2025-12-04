# OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App

![Build Status](https://img.shields.io/github/actions/workflow/user/chirag127/OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App/ci.yml?style=flat-square)
![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App?style=flat-square)
![Tech Stack](https://img.shields.io/badge/TechStack-TypeScript%2C%20NodeJS%2C%20Tauri-blue?style=flat-square)
![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-orange?style=flat-square)
![GitHub Stars](https://img.shields.io/github/stars/chirag127/OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App?style=flat-square)

**OmniPublish** is a sophisticated TypeScript application designed to automate content syndication across numerous blogging platforms. Write content once in Markdown and distribute it seamlessly to 11+ platforms, ensuring idempotency, robust retry logic, and optional static site generation for enhanced reach and reliability.

⭐ **Star this Repo** ⭐

---

## Table of Contents

*   [Features](#features)
*   [Architecture](#architecture)
*   [Getting Started](#getting-started)
*   [Usage](#usage)
*   [Development Standards](#development-standards)
*   [AI Agent Directives](#ai-agent-directives)
*   [Contributing](#contributing)
*   [License](#license)

---

## Features

*   **Multi-Platform Syndication:** Publish content to over 11 popular blogging platforms simultaneously.
*   **Markdown First:** Write all your content in standard Markdown format.
*   **Idempotency & Retries:** Ensures content is published exactly once, with automatic retry mechanisms for transient failures.
*   **Static Site Generation:** Option to generate static HTML sites from your syndicated content.
*   **CI/CD Integration:** Fully automated build, test, and deployment pipelines.
*   **Issue-to-Post Conversion:** Transform GitHub issues directly into blog posts.
*   **Structured Logging:** Comprehensive logging for monitoring and debugging.
*   **Modern Tech Stack:** Built with TypeScript, Vite, and Tauri for a high-performance desktop application experience.

---

## Architecture

This project follows a **Feature-Sliced Design (FSD)** approach for maintainability and scalability, leveraging a **Hexagonal Architecture (Ports & Adapters)** for clean separation of concerns.

mermaid
graph TD
    A[Application Layer]
    B[Domain Layer]
    C[Infrastructure Layer]
    D[UI Layer]

    A --> B
    A --> C
    A --> D

    B --> C

    subgraph UI
        D1[Desktop App (Tauri)]
        D2[CLI Tool]
    end

    subgraph Core Logic
        B1[Content Syndication Service]
        B2[Publishing Adapters]
        B3[Idempotency Manager]
    end

    subgraph External Integrations
        C1[Blogging Platform APIs]
        C2[Markdown Parser]
        C3[Static Site Generator]
        C4[Logging Service]
    end

    D1 --> A
    D2 --> A

    A --> B1
    B1 --> B2
    B1 --> B3

    B2 --> C1
    B1 --> C2
    B1 --> C3
    A --> C4

    %% Ports & Adapters Visualization
    subgraph Ports & Adapters
        direction LR
        P1[ContentService Port]
        A1[ContentService Adapter]
        P2[Publishing Port]
        A2[BloggingPlatformAdapter]
        P3[Idempotency Port]
        A3[IdempotencyAdapter]
    end

    B1 -- depends on --> P1
    P1 -- is implemented by --> A1
    A1 -- interacts with --> B

    B2 -- depends on --> P2
    P2 -- is implemented by --> A2
    A2 -- interacts with --> C1

    B3 -- depends on --> P3
    P3 -- is implemented by --> A3
    A3 -- manages --> B



---

## Getting Started

### Prerequisites

*   Node.js 20+ or equivalent runtime
*   npm or Yarn
*   TypeScript 5.x+

### Installation

bash
# Clone the repository
git clone https://github.com/chirag127/OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App.git
cd OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App

# Install dependencies
npm install
# or
yarn install


---

## Usage

bash
# Build the application
npm run build

# Run the CLI tool (example)
./dist/cli <command> [options]

# For development, run with hot-reloading
npm run dev


---

## Development Standards

*   **Principles:**
    *   **SOLID:** Maintainable and understandable object-oriented design.
    *   **DRY:** Don't Repeat Yourself. Maximize code reuse.
    *   **YAGNI:** You Ain't Gonna Need It. Focus on current requirements.
*   **Linting & Formatting:** Biome is used for ultra-fast linting and code formatting.
*   **Testing:** Vitest for unit and integration tests, Playwright for end-to-end testing.
*   **Architecture:** Adherence to Feature-Sliced Design (FSD) and Hexagonal Architecture.

---

## AI Agent Directives

<details>
<summary>View AI Agent Directives</summary>

# SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

## 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

---

## 2. INPUT PROCESSING & COGNITION
*   **SPEECH-TO-TEXT INTERPRETATION PROTOCOL:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **MANDATORY MCP INSTRUMENTATION:**
    *   **No Guessing:** Do not hallucinate APIs.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

---

## 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** Detect the project type (`package.json` for TypeScript/NodeJS) and apply the corresponding **Apex Toolchain**.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project leverages **TypeScript 6.x (Strict)**, **Vite 7 (Rolldown)** for bundling, and **Tauri v2.x** for desktop application development. **WXT** is the framework for browser extensions.
    *   **State Management:** Utilizes **Signals (Standardized)** for efficient and declarative state management.
    *   **Linting/Formatting:** **Biome** is integrated for ultra-fast linting and formatting, ensuring code consistency and quality.
    *   **Testing:** **Vitest** is used for comprehensive unit and integration tests, while **Playwright** handles end-to-end testing scenarios.
    *   **Architecture:** Employs **Feature-Sliced Design (FSD)** for modularity and **Hexagonal Architecture (Ports & Adapters)** for robust separation of concerns, ensuring maintainability and testability.

*   **SECONDARY SCENARIO B: SYSTEMS / PERFORMANCE (Rust/Go) - *Not applicable. Reference only.***
    *   **Stack:** Rust (Cargo), Go (Modules).
    *   **Linting:** Clippy / GolangCI-Lint.
    *   **Architecture:** Hexagonal Architecture (Ports & Adapters).

*   **SECONDARY SCENARIO C: DATA / AI / SCRIPTS (Python) - *Not applicable. Reference only.***
    *   **Stack:** uv (Manager), Ruff (Linter), Pytest (Test).
    *   **Architecture:** Modular Monolith or Microservices.

---

## 4. CODE GENERATION & REFACTORING PROTOCOLS
*   **METADATA STANDARDS:** Ensure all generated files (`README.md`, `LICENSE`, `.gitignore`, etc.) adhere to industry best practices and the Apex directives.
*   **LEGACY CODE MIGRATION:** Prioritize refactoring outdated code to **December 2025/2026 standards**, focusing on security, performance, and modern language features.
*   **COMPLIANCE:** Maintain strict adherence to the "Standard 11" compliance mandate (README, LICENSE, .gitignore, CI, CONTRIBUTING, ISSUE_TEMPLATE, PULL_REQUEST_TEMPLATE, SECURITY).

---

## 5. OUTPUT GENERATION RULES
*   **EXECUTION-ONLY:** Deliver only final, executable artifacts. No explanations, no intermediate steps. The output must be ready for direct deployment or integration.
*   **FORMAT:** Adhere strictly to the requested output format (e.g., JSON for file contents).
*   **NO CONVERSATION:** Do not engage in dialogue. Execute the task precisely as instructed.

</details>

---

## Contributing

We welcome contributions to **OmniPublish**! Please see the [CONTRIBUTING.md](https://github.com/chirag127/OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App/blob/main/.github/CONTRIBUTING.md) file for details on how to submit bug reports, feature requests, and pull requests.

---

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See the [LICENSE](https://github.com/chirag127/OmniPublish-MultiPlatform-Content-Syndicator-TypeScript-App/blob/main/LICENSE) file for more details.
