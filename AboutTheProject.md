# CapitalClarity

*“Smart spending starts with smart awareness.”*

CapitalClarity is a **Gemini AI-powered React Native app** designed to help users take control of their finances. By analyzing your spending history, the app delivers **real-time, personalized financial insights** that empower you to make smarter, budget-conscious decisions. Think of it as your **intelligent financial coach**, always learning and guiding you.

---

## The Problem

Many people—especially students—struggle with managing personal finances. The issue isn’t always about income, but rather a lack of awareness and context around spending.

> “I check my bank app and just think… *where did all my money go?*”

In fact:
- **42% of college students carry credit card debt**, often unaware of how daily habits accumulate.
- Small, frequent purchases tend to slip under the radar, making budgeting difficult.
- Existing financial tools often feel disconnected or require too much manual input.

---

## Inspiration

CapitalClarity was born out of personal pain points:

> “We’ve both had moments where we blew our entire paycheck in a weekend—without really knowing how.”

1. On-campus job earnings would quickly disappear with little to show for it.
2. Impulse spending became a norm due to lack of financial feedback in real-time.
3. We needed something proactive—not reactive—that could *learn from us* and help build healthier habits.

---

## The Project

CapitalClarity doesn't just track expenses—it **understands them**. By combining AI-powered reasoning with user-specific context, the app classifies expenses, flags potentially wasteful spending, and adapts over time.

### Technologies Used

| Tech | Why We Chose It |
|------|-----------------|
| **React Native** | Unified mobile development across platforms, enabling quick iteration and a polished user experience. |
| **Flask (Python)** | Gave us access to Python’s ecosystem for processing data and running AI models efficiently. |
| **Gemini AI 2.5** | Handled deep analysis—e.g., determining if a purchase at "Target" was an emergency or impulse buy. |
| **Gemini AI 2.0 Multi-Input** | Allowed fast, continuous input handling for adaptive learning based on real-time transaction streams. |

---

## What We Learned

1. **Financial behavior is complex** – Classifying spending as “unnecessary” often requires understanding personal context, not just transaction data.
2. **User-centric design is crucial** – The more intuitive the interface, the more likely users will stick around and benefit.
3. **End-to-end integration matters** – Building a fast, reliable pipeline from Plaid → Backend → AI → UI was key to delivering real-time insights.
4. **Feedback loops improve accuracy** – Our predictions became much sharper once we added in user feedback and historical behavior reinforcement.

> “The model got better once it *listened* to what we had to say.”

---

## ⚠️ Challenges Faced

### 1. Real-Time Data Pipeline

Getting real banking data is *hard*. We attempted to use the **Plaid API** to seamlessley integrate with Capital One, Chase, and other bank accounts, but were blocked by multi-day api approval. 

Thus, we had to pivot into creative solutions for getting transaction data, emulating the real-time nature we wanted the application to capture.

### 2. Accurate Predictions with Limited Data

Here’s the tough part: we often had only the **vendor name** and **amount** for each transaction.

> “$8.99 at Taco Bell —was it a meal or a craving induced snack”

To tackle this, we:
- Analyzed **time of transaction** to detect patterns
- Used **merchant categories** to infer context (e.g., groceries vs. fast food)
- Collected **user feedback** to fine-tune prediction weights

This created a feedback loop that made the app *smarter* the more you used it.

---

# Looking Ahead

CapitalClarity is still evolving. Some ideas we’re excited to explore:
- Better **AI Insights** to teach users about their spending habits in a personal manner
- **Bank Integrations** to allow for a more seamless approach to our application
- **Personalizing** the app, recognizing different cultures and spending habits to create a more inclusive environments.

> “We want this to be less of an app—and more of a personal money mentor.”

---

*Built with clarity in mind. Powered by AI. Designed for your life.*

