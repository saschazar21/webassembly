export interface Exif {
  make?: string;
  model?: string;
  software?: string;
  bitsPerSample?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageDescription?: string;
  orientation?: number;
  copyright?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  subSecTimeOriginal?: string;
  exposureTime?: number;
  fStop?: number;
  exposureProgram?: number;
  isoSpeedRatings?: number;
  subjectDistance?: number;
  exposureBiasValue?: number;
  flash?: number;
  flashReturnedLight?: number;
  flashMode?: number;
  meteringMode?: number;
  focalLength?: number;
  focalLengthIn35mm?: number;
  geoLocation?: {
    latitude?: number;
    latDegrees?: number;
    latMinutes?: number;
    latSeconds?: number;
    latDirection?: number;
    longitude?: number;
    lonDegrees?: number;
    lonMinutes?: number;
    lonSeconds?: number;
    lonDirection?: number;
    altitude?: number;
    precisionDOP?: number;
  };
  lensInfo?: {
    focalLengthMin?: number;
    focalLengthMax?: number;
    fStopMin?: number;
    fStopMax?: number;
    lensMake?: string;
    lensModel?: string;
    focalPlaneXResolution?: number;
    focalPlaneYResolution?: number;
  };
}

export interface ExifModule extends EmscriptenModule {
  exif(buffer: BufferSource, length: number): Exif;
}

export default function (
  moduleOverrides?: Partial<ExifModule>
): Promise<ExifModule>;
