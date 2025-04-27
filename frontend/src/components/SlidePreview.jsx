import { useState } from 'react';
import ImageZoom from './ImageZoom';

function SlidePreview({ result }) {
  const [zoomImage, setZoomImage] = useState(null);

  return (
    <div className="border border-bridgestone-black p-4 rounded shadow bg-bridgestone-white">
      <h2 className="text-xl font-semibold text-bridgestone-black">
        {result.file} {result.slideNumber ? `- Slide ${result.slideNumber}` : 'Document'}
      </h2>
      <p className="mt-2 text-bridgestone-black">
        {result.text.substring(0, 300)}{result.text.length > 300 ? '...' : ''}
      </p>
      {result.images?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-bridgestone-black">Images:</h3>
          <div className="flex flex-wrap gap-2">
            {result.images.map((img, imgIndex) => (
              <img
                key={imgIndex}
                src={`data:${img.type};base64,${img.data}`}
                alt={`Image ${imgIndex + 1}`}
                className="max-w-xs cursor-pointer"
                onClick={() => setZoomImage(img)}
              />
            ))}
          </div>
        </div>
      )}
      {zoomImage && (
        <ImageZoom image={zoomImage} onClose={() => setZoomImage(null)} />
      )}
    </div>
  );
}

export default SlidePreview;