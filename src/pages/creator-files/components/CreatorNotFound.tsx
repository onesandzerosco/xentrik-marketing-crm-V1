
import React from 'react';

export const CreatorNotFound: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Creator not found</h1>
      <p className="mt-2">
        The creator you're looking for doesn't exist or you don't have access.
      </p>
    </div>
  );
};
