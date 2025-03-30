import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuizSection from "./QuizSection";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  openai,
  invokeDeepSeekQuizGenerator,
  invokeDeepSeekSummaryGenerator,
} from "../services/deepSeek";

export default function AIQuizNotes() {
  // ! holy this is sick
  const { state } = useLocation();
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");

  // ! this allows us not to exhausted the API call
  const [isDeveloping] = useState(false);

  useEffect(() => {
    const generateContent = async () => {
      if (!state?.transcript) return;

      try {
        let quizResponse, summaryResponse;

        if (!isDeveloping && openai) {
          // checking if OpenAI client is available
          const quizRaw = await invokeDeepSeekQuizGenerator(
            state.transcript,
            state.model
          );
          const summaryRaw = await invokeDeepSeekSummaryGenerator(
            state.transcript,
            state.model
          );

          // Clean and parse responses
          quizResponse = JSON.parse(quizRaw.replace(/```json|```/g, "").trim());
          summaryResponse = summaryRaw.replace(/```html|```/g, "").trim();
        } else {
          // Use placeholder data for development
          quizResponse = {
            quiz: [
              {
                question: "What is the primary role of a router in a network?",
                options: [
                  "A. To store data permanently",
                  "B. To forward data packets between computers in the network",
                  "C. To cool down the servers",
                  "D. To provide long-term storage for files",
                ],
                correct: "B",
                explanation:
                  "A router is a device that forwards data packets between computers in a network, ensuring that the data reaches its intended destination. This is similar to how a post office routes letters to the correct address.",
              },
              {
                question: "What does RAM stand for in the context of servers?",
                options: [
                  "A. Random Access Memory",
                  "B. Read-Only Memory",
                  "C. Remote Access Module",
                  "D. Routing and Management",
                ],
                correct: "A",
                explanation:
                  "RAM stands for Random Access Memory, which is a type of fast memory used by servers to store and retrieve information quickly. It is essential for performing computations and running applications efficiently.",
              },
              {
                question: "What is the main purpose of a database in a server?",
                options: [
                  "A. To cool down the CPU",
                  "B. To store data in a structured way for easy querying",
                  "C. To route data packets",
                  "D. To provide power supply to the server",
                ],
                correct: "B",
                explanation:
                  "A database is used to store data in a structured format, making it easy to search, query, and retrieve information. This is crucial for applications that require quick access to large amounts of data.",
              },
              {
                question:
                  "What is the primary function of a switch in a network?",
                options: [
                  "A. To store data permanently",
                  "B. To forward data packets to the correct client within a network,",
                  "C. To provide cooling for the servers",
                  "D. To manage the power supply",
                ],
                correct: "B",
                explanation:
                  "A switch is a networking device that forwards data packets to the correct client within a network. It ensures that data reaches the intended recipient efficiently.",
              },
              {
                question:
                  "What is the main advantage of using the cloud over traditional IT infrastructure?",
                options: [
                  "A. It requires more physical space",
                  "B. It eliminates the need for maintenance and scaling",
                  "C. It provides on-demand resources and scalability",
                  "D. It increases the need for manual intervention",
                ],
                correct: "C",
                explanation:
                  "The cloud provides on-demand resources and scalability, allowing businesses to scale up or down based on their needs without the hassle of maintaining physical servers. AWS services like EC2 (Elastic Compute Cloud) and S3 (Simple Storage Service) are examples of cloud resources that offer scalability.",
              },
              {
                question: "What is the role of a DNS server in a network?",
                options: [
                  "A. To store data permanently",
                  "B. To translate domain names into IP addresses",
                  "C. To provide cooling for the servers",
                  "D. To manage the power supply",
                ],
                correct: "B",
                explanation:
                  "A DNS (Domain Name System) server translates human-readable domain names (like www.example.com) into IP addresses that computers use to identify each other on the network. This is essential for routing data packets correctly.",
              },
              {
                question: "What is the primary function of a CPU in a server?",
                options: [
                  "A. To store data permanently",
                  "B. To perform computations and calculations",
                  "C. To route data packets",
                  "D. To provide cooling for the server",
                ],
                correct: "B",
                explanation:
                  "The CPU (Central Processing Unit) is responsible for performing computations and calculations in a server. It is the 'brain' of the server, handling tasks and processing data.",
              },
              {
                question: "What is a data center?",
                options: [
                  "A. A device that routes data packets",
                  "B. A facility that houses servers and networking equipment",
                  "C. A type of memory used in servers",
                  "D. A cooling system for servers",
                ],
                correct: "B",
                explanation:
                  "A data center is a facility that houses servers, networking equipment, and other IT infrastructure. It is designed to store, process, and manage large amounts of data efficiently.",
              },
              {
                question:
                  "What is the main challenge of scaling traditional IT infrastructure?",
                options: [
                  "A. It is easy to scale quickly",
                  "B. It requires significant time, space, and resources",
                  "C. It does not require maintenance",
                  "D. It is cost-effective",
                ],
                correct: "B",
                explanation:
                  "Scaling traditional IT infrastructure requires significant time, space, and resources. Businesses need to purchase, install, and maintain additional servers, which can be costly and time-consuming.",
              },
              {
                question:
                  "What is the primary benefit of using cloud computing for disaster recovery?",
                options: [
                  "A. It increases the risk of data loss",
                  "B. It provides redundancy and backup options",
                  "C. It requires more physical space",
                  "D. It eliminates the need for maintenance",
                ],
                correct: "B",
                explanation:
                  "Cloud computing provides redundancy and backup options, making it easier to recover data in the event of a disaster. AWS services like S3 (Simple Storage Service) and Glacier offer robust backup and recovery solutions.",
              },
            ],
          };
          summaryResponse = `### Notes on Stephan Mareek's AWS AI Practitioner Exam Course - Section 1: Introduction to Cloud Computing

---

#### **1. Basics of How Websites Work**
- **Client-Server Model**:
  - A **client** (e.g., web browser) sends a request to a **server** over a network.
  - The server processes the request and sends a response back to the client.
  - **IP Addresses** are used to identify clients and servers, similar to addresses on letters.

- **Analogy**:
  - Sending a letter: 
    - Client = You writing the letter.
    - Network = Post office routing the letter.
    - Server = Recipient who replies using your return address.

---

#### **2. Components of a Server**
A server is like a "brain" for computing tasks. It consists of:
1. **CPU (Central Processing Unit)**:
   - Performs computations and calculations.
2. **RAM (Random Access Memory)**:
   - Fast, temporary memory for quick data access.
3. **Storage**:
   - Long-term storage for files and data.
   - **Databases**: Structured storage for easy querying and searching.
4. **Networking**:
   - Routers, switches, and DNS servers to manage data flow.

---

#### **3. Networking Basics**
- **Network**: A system of cables, routers, and servers connected to each other.
- **Router**: Forwards data packets between networks (like a post delivery service).
- **Switch**: Directs data packets to the correct client within a network.

---

#### **4. Traditional IT Infrastructure**
- **Early Days**:
  - Companies started with servers in homes or garages (e.g., Google).
  - As demand grew, more servers were added, leading to the need for dedicated spaces.
- **Data Centers**:
  - Dedicated rooms or facilities filled with servers.
  - Companies scaled by adding more servers.

- **Challenges with Traditional IT**:
  1. **Costs**:
     - Rent, power supply, cooling, and maintenance.
  2. **Scalability**:
     - Limited by physical space and time to set up new servers.
  3. **Disaster Risks**:
     - Earthquakes, power outages, or fires could disrupt operations.
  4. **24/7 Monitoring**:
     - Requires a dedicated team to manage infrastructure.

---

#### **5. Introduction to the Cloud**
- **Cloud Computing**:
  - Solves the challenges of traditional IT by externalizing infrastructure.
  - Provides **on-demand** access to compute, memory, storage, and networking resources.
  - Eliminates the need for physical servers, data centers, and manual maintenance.

---

#### **Real-World Applications and Use Cases**
1. **Startups**:
   - Start small without investing in physical servers.
   - Scale quickly as the business grows.
2. **E-commerce**:
   - Handle traffic spikes during sales or promotions.
3. **Disaster Recovery**:
   - Cloud providers offer redundancy and backup solutions.
4. **AI and Machine Learning**:
   - Access powerful computing resources for training models without owning hardware.

---

#### **Key Takeaways**
- **Cloud Computing** is a game-changer for businesses, offering scalability, cost-efficiency, and reliability.
- Traditional IT infrastructure is limited by physical constraints, while the cloud provides flexibility and on-demand resources.
- Understanding the basics of servers, networking, and data centers is crucial for grasping cloud concepts.


| Concept                | Explanation |
|------------------------|------------|
| **Cloud Computing**    | Provides scalability, cost-efficiency, and reliability for businesses. |
| **Traditional IT**     | Limited by physical constraints, unlike the cloud which offers flexibility. |
| **On-Demand Resources** | The cloud allows businesses to scale resources as needed, reducing waste. |
| **Networking & Servers** | Understanding these fundamentals is key to grasping cloud concepts. |

#### **Next Steps**
- In the next lecture, we’ll dive deeper into **what the cloud is** and how it works.

These notes should help you follow along with Stephan Mareek's video and prepare effectively for the AWS AI Practitioner Exam!`;
        }

        if (!openai) {
          toast.warn(
            "OpenAI client is not available. Demo data is being used.",
            {
              position: "top-center",
              autoClose: 2000, // Closes after 3 seconds
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }

        setResponse(quizResponse.quiz);
        setSummary(summaryResponse);
      } catch (error) {
        console.error("Generation error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [state, isDeveloping]);

  if (!state?.transcript) {
    return <div>No transcript provided. Please go back and enter one.</div>;
  }

  if (isLoading) {
    return <div>Generating content...</div>;
  }

  return (
    <div className="content-container">
      <div className="shadow-sm z-50">
        <div className="tab-buttons-container">
          <div className="tab-buttons-inner max-[920px]:!left-0 max-[920px]:!justify-center">
            <button
              className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              Quiz
            </button>
            <button
              className={`tab-button ${
                activeTab === "summary" ? "active" : ""
              }`}
              onClick={() => setActiveTab("summary")}
            >
              Study Notes
            </button>
          </div>
        </div>
      </div>

      {activeTab === "quiz" ? (
        <div className="tab-content">
          <QuizSection response={response} />
        </div>
      ) : (
        <div className="mt-4 prose prose-lg prose-blue max-w-3xl mx-auto p-6 text-gray-200 shadow-lg rounded-lg leading-relaxed space-y-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
