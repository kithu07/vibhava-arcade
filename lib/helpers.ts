import { ObjectId } from "mongodb";

/**
 * Creates a MongoDB query to search for a player by various ID formats
 * 
 * @param id - The player ID in any format (ObjectId, string ID, custom playerId)
 * @returns MongoDB query object
 */
export function createPlayerIdQuery(id: string) {
  let playerQuery: any;
  
  // Empty checks
  if (!id) {
    throw new Error("Player ID is required");
  }
  
  if (ObjectId.isValid(id)) {
    // If it looks like an ObjectId, try that first
    try {
      playerQuery = { _id: new ObjectId(id) };
    } catch (err) {
      // If ObjectId creation fails, fall back to string comparison
      playerQuery = { 
        $or: [
          { playerId: id },
          { _id: id }
        ]
      };
    }
  } else {
    // Otherwise, try playerId field or other formats
    playerQuery = { 
      $or: [
        { playerId: id },
        { _id: id }
      ]
    };
  }
  
  return playerQuery;
}

/**
 * Formats a MongoDB document to ensure IDs are serialized as strings
 * 
 * @param doc - MongoDB document
 * @returns Document with string IDs
 */
export function formatDocumentWithStringId(doc: any) {
  if (!doc) return null;
  
  return {
    ...doc,
    _id: doc._id.toString()
  };
} 