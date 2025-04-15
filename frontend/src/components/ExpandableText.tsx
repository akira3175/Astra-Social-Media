import React, { useState, useRef, useEffect } from 'react';
import { Typography, Link } from '@mui/material';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLines = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (element) {
        const isTextOverflow = element.scrollHeight > element.clientHeight;
        setIsOverflow(isTextOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <>
      <Typography
        ref={textRef}
        variant="body1"
        sx={{
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: isExpanded ? 'unset' : maxLines,
        }}
      >
        {text}
      </Typography>
      {isOverflow && (
        <Link
          component="button"
          variant="body2"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {isExpanded ? 'Ẩn bớt' : 'Xem thêm'}
        </Link>
      )}
    </>
  );
};

export default ExpandableText;