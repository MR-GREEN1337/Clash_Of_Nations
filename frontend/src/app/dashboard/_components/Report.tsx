import React, { useState, useEffect } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';

type Props = {
  streamFinished: boolean;
}

const Report: React.FC<Props> = ({ streamFinished }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/report', {
          headers: {
            Accept: 'application/octet-stream',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setLoading(false);
        setDownloadUrl(url);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    if (streamFinished) {
      fetchReportData();
    }
  }, [streamFinished]);

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'report.pdf';
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null); 
    }
  };

  return (
    <div className='flex items-center justify-center'>
      <div className='flex flex-row justify-start ml-30'>
        {
          streamFinished ? (
          loading ? (
            <button
              className="px-20 py-10 rounded-md border border-gold bg-white text-black text-sm flex items-center justify-center"
              disabled
            >
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Generating ...
            </button>
          ) : (
            <button
              className="px-20 py-10 rounded-md border border-gold bg-white text-black text-sm hover:shadow-[8px_12px_0px_0px_gold] transition duration-200"
              onClick={handleDownload}
            >
              <p className='text-2xl'>Download Report</p>
            </button>
          )
        ) : (
          <div className='flex flex-row justify-start ml-30'>
            <p>Simulation hasn't finished yet</p>
            <img src="ghost.png" alt="" />
          </div>
        )
        }
      </div>
    </div>
  );
};

export default Report;
