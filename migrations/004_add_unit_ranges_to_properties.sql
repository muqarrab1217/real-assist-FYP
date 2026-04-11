-- Add unit range configuration columns to properties table
ALTER TABLE public.properties
ADD COLUMN room_number_min INTEGER,
ADD COLUMN room_number_max INTEGER,
ADD COLUMN floor_number_min INTEGER,
ADD COLUMN floor_number_max INTEGER,
ADD COLUMN unit_number_min TEXT,
ADD COLUMN unit_number_max TEXT,
ADD COLUMN area_min NUMERIC,
ADD COLUMN area_max NUMERIC,
ADD COLUMN unit_types JSONB DEFAULT '[]'::jsonb;

-- Create index for performance (optional but recommended)
CREATE INDEX idx_properties_unit_ranges ON public.properties(room_number_min, room_number_max, floor_number_min, floor_number_max);

-- Add comment for documentation
COMMENT ON COLUMN public.properties.room_number_min IS 'Minimum room number for units in this project';
COMMENT ON COLUMN public.properties.room_number_max IS 'Maximum room number for units in this project';
COMMENT ON COLUMN public.properties.floor_number_min IS 'Minimum floor number for units in this project';
COMMENT ON COLUMN public.properties.floor_number_max IS 'Maximum floor number for units in this project';
COMMENT ON COLUMN public.properties.unit_number_min IS 'Minimum unit number (can be numeric or alphanumeric)';
COMMENT ON COLUMN public.properties.unit_number_max IS 'Maximum unit number (can be numeric or alphanumeric)';
COMMENT ON COLUMN public.properties.area_min IS 'Minimum area in square feet';
COMMENT ON COLUMN public.properties.area_max IS 'Maximum area in square feet';
COMMENT ON COLUMN public.properties.unit_types IS 'JSON array of available unit types e.g. ["Studio", "1BR", "2BR", "Penthouse"]';
