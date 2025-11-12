import { useEffect } from 'react';

interface UsePageTitleOptions {
  title: string;
  suffix?: string;
}

export const usePageTitle = ({ title, suffix = 'Nexxtap' }: UsePageTitleOptions) => {
  useEffect(() => {
    const fullTitle = suffix ? `${title} - ${suffix}` : title;
    document.title = fullTitle;
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Nexxtap';
    };
  }, [title, suffix]);
};
