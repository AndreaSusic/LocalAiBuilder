import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User data route - for dashboard
  app.get('/api/user-data', async (req: any, res) => {
    try {
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        console.log(`Loading data for authenticated user: ${userId}`);
        
        // Get website data for this user
        const website = await storage.getWebsiteByUserId(userId);
        
        if (website) {
          console.log(`Found website data for user ${userId}`);
          res.json(website.websiteData);
          return;
        } else {
          console.log(`No website data found for user ${userId}`);
        }
      } else {
        console.log('User not authenticated, loading test data');
      }
      
      // Return test data for demonstration
      const testData = {
        company: "Austin Premier Dental",
        industry: "dentist",
        city: "Austin",
        services: ["General Dentistry", "Cosmetic Dentistry", "Teeth Whitening"],
        colors: { primary: "#2c5aa0", secondary: "#f8f9fa" },
        images: [
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        gbp: {
          name: "Austin Premier Dental",
          address: "123 Main St, Austin, TX 78701",
          phone: "(512) 555-0123",
          rating: 4.8,
          reviews: [
            {
              author: "Sarah Johnson",
              rating: 5,
              text: "Excellent service and very professional staff. Highly recommend!"
            },
            {
              author: "Mike Chen",
              rating: 5,
              text: "Best dental care I've ever received. The team is amazing."
            }
          ]
        }
      };
      
      console.log('Returning test data for demonstration');
      res.json(testData);
      
    } catch (error) {
      console.error("Error in /api/user-data:", error);
      res.status(500).json({ message: "Failed to load user data" });
    }
  });

  // Save completed website
  app.post('/api/complete-website', async (req: any, res) => {
    try {
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const websiteData = req.body;
        
        console.log(`Saving completed website for user: ${userId}`);
        
        await storage.saveWebsite(userId, websiteData);
        
        res.json({ success: true, message: "Website saved successfully" });
      } else {
        res.status(401).json({ message: "Authentication required" });
      }
    } catch (error) {
      console.error("Error saving website:", error);
      res.status(500).json({ message: "Failed to save website" });
    }
  });

  // Save draft
  app.post('/api/save-draft', async (req: any, res) => {
    try {
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const draftData = req.body;
        
        console.log(`Saving draft for user: ${userId}`);
        
        await storage.saveDraft(userId, draftData);
        
        res.json({ success: true, message: "Draft saved successfully" });
      } else {
        // Save draft by session ID for unauthenticated users
        const sessionId = req.sessionID;
        console.log(`Saving draft for session: ${sessionId}`);
        
        const draftId = `draft_session_${sessionId}_${Date.now()}`;
        await storage.saveDraft(null, { ...req.body, sessionId });
        
        res.json({ success: true, message: "Draft saved successfully" });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      res.status(500).json({ message: "Failed to save draft" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}