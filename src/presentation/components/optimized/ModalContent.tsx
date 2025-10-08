// presentation/components/optimized/ModalContent.tsx
import React, { memo } from 'react';

interface ModalContentProps {
  children: React.ReactNode;
}

export const ModalContent = memo<ModalContentProps>(({ children }) => {
  return <>{children}</>;
});

ModalContent.displayName = 'ModalContent';
