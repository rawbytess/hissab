CREATE TABLE public.test_emails (
    id uuid not null,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    otp TEXT NOT NULL DEFAULT '123456'
);

ALTER TABLE public.test_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users to read test_emails"
    ON public.test_emails FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service_role to manage test_emails"
    ON public.test_emails FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.preset_otp()
    RETURNS TRIGGER AS $$
DECLARE
    is_test_email BOOLEAN;
    user_fixed_otp TEXT;
    fixed_otp_hash TEXT;
BEGIN
    -- Check if the new email is in the test_emails table and retrieve its fixed_otp
    SELECT TRUE, te.otp
    INTO is_test_email, user_fixed_otp
    FROM public.test_emails te
    WHERE te.email = NEW.email;

    -- If is_test_email is NULL (meaning no row was found), set it to FALSE
    IF is_test_email IS NULL THEN
        is_test_email := FALSE;
    END IF;

    IF is_test_email THEN
        -- Generate the recovery_token using the specific fixed_otp for this email
        -- This is the crucial part: `user_fixed_otp` is now used
        fixed_otp_hash := encode(sha224(concat(NEW.email, user_fixed_otp)::bytea), 'hex');

        NEW.recovery_token := fixed_otp_hash;
        NEW.recovery_sent_at := NOW() - INTERVAL '2 minutes'; -- Prevents email sending and avoids rate limits
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE TRIGGER preset_otp_trigger
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.preset_otp();
