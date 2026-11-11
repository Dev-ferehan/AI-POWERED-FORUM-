export const chunksText = (text, chunkSize = 800, overlap = 100) => {
    const chunks = [];
    let index = 0;
  
    
    while (index < text.length) {
      let chunk = text.slice(index, index + chunkSize);
  
      const trimmedChunk = chunk.trim();
      if (trimmedChunk.length > 0) {
        chunks.push(trimmedChunk);
      }
      
      index += chunkSize - overlap; 
    }
  
    return chunks;
  };