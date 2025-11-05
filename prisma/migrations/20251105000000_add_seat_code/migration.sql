-- AlterTable: Add code column as nullable first
ALTER TABLE "Seat" ADD COLUMN "code" TEXT;

-- Generate unique 14-digit codes for existing seats
-- Using a combination of timestamp and row-specific data
DO $$
DECLARE
    seat_record RECORD;
    unique_code TEXT;
    base_timestamp BIGINT;
BEGIN
    base_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    FOR seat_record IN SELECT id FROM "Seat" ORDER BY "createdAt"
    LOOP
        -- Generate a unique 14-digit code
        -- Format: 10 digits from timestamp + 4 random digits
        unique_code := LPAD((base_timestamp % 10000000000)::TEXT, 10, '0') || 
                      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Ensure uniqueness by checking and regenerating if needed
        WHILE EXISTS (SELECT 1 FROM "Seat" WHERE code = unique_code) LOOP
            unique_code := LPAD((base_timestamp % 10000000000)::TEXT, 10, '0') || 
                          LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        END LOOP;
        
        -- Update the seat with the generated code
        UPDATE "Seat" SET code = unique_code WHERE id = seat_record.id;
        
        -- Increment to ensure different codes
        base_timestamp := base_timestamp + 1;
    END LOOP;
END $$;

-- Make code column NOT NULL
ALTER TABLE "Seat" ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Seat_code_key" ON "Seat"("code");

-- CreateIndex
CREATE INDEX "Seat_code_idx" ON "Seat"("code");

