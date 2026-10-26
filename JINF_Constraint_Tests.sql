/*
JINF PostgreSQL constraint smoke tests — NON-PERSISTENT
Database: jinf_dev
Run in pgAdmin Query Tool connected to jinf_dev.

SAFETY:
- All test fixtures are created inside a transaction and rolled back at the end.
- The script inserts temporary test users/categories/locations/reports/claims/photos.
- Do not remove the final ROLLBACK.
- Run on a development database first.
- The tests check database constraints, not API/service rules.
*/

BEGIN;

DO $$
DECLARE
    v_user1 text := 'jinf-db-test-user-1-' || gen_random_uuid()::text;
    v_user2 text := 'jinf-db-test-user-2-' || gen_random_uuid()::text;
    v_user3 text := 'jinf-db-test-user-3-' || gen_random_uuid()::text;
    v_cat integer;
    v_loc integer;
    v_report1 integer;
    v_report2 integer;
    v_claim1 integer;
    v_photo integer;
    v_pass boolean;
    v_failed integer := 0;
    v_passed integer := 0;
    v_username1 text;
    v_username2 text;
    v_username3 text;
    v_storage text := 'jinf-test-storage-' || gen_random_uuid()::text;
BEGIN
    RAISE NOTICE 'Starting JINF database constraint tests (all data will be rolled back).';

    -- Test fixtures: ASP.NET Identity requires these non-null fields in this schema.
    v_username1 := upper(v_user1);
    v_username2 := upper(v_user2);
    v_username3 := upper(v_user3);

    INSERT INTO public."AspNetUsers"
      ("Id","UserName","NormalizedUserName","Email","NormalizedEmail",
       "EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp",
       "PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd",
       "LockoutEnabled","AccessFailedCount","FullName")
    VALUES
      (v_user1, v_user1, v_username1, v_user1 || '@example.invalid',
       upper(v_user1 || '@example.invalid'), false, NULL, gen_random_uuid()::text,
       gen_random_uuid()::text, NULL, false, false, NULL, true, 0, 'JINF DB Test User 1'),
      (v_user2, v_user2, v_username2, v_user2 || '@example.invalid',
       upper(v_user2 || '@example.invalid'), false, NULL, gen_random_uuid()::text,
       gen_random_uuid()::text, NULL, false, false, NULL, true, 0, 'JINF DB Test User 2'),
      (v_user3, v_user3, v_username3, v_user3 || '@example.invalid',
       upper(v_user3 || '@example.invalid'), false, NULL, gen_random_uuid()::text,
       gen_random_uuid()::text, NULL, false, false, NULL, true, 0, 'JINF DB Test User 3');

    INSERT INTO public."Categories" ("Name","IsSensitive","IsActive")
    VALUES ('JINF DB Test Category ' || gen_random_uuid()::text, false, true)
    RETURNING "Id" INTO v_cat;

    INSERT INTO public."Locations" ("Name","IsActive")
    VALUES ('JINF DB Test Location ' || gen_random_uuid()::text, true)
    RETURNING "Id" INTO v_loc;

    -- Valid report fixture (ReportType: 1=Found; Status: 0=Open).
    INSERT INTO public."ItemReports"
      ("ReporterId","ReportType","Title","Description","CategoryId","LocationId",
       "EventDate","Status","CreatedAt","UpdatedAt","ReturnedAt","ReturnedById")
    VALUES
      (v_user1, 1, 'JINF test report 1', 'Temporary database constraint test',
       v_cat, v_loc, CURRENT_DATE, 0, now(), NULL, NULL, NULL)
    RETURNING "Id" INTO v_report1;

    INSERT INTO public."ItemReports"
      ("ReporterId","ReportType","Title","Description","CategoryId","LocationId",
       "EventDate","Status","CreatedAt","UpdatedAt","ReturnedAt","ReturnedById")
    VALUES
      (v_user1, 1, 'JINF test report 2', 'Temporary database constraint test',
       v_cat, v_loc, CURRENT_DATE, 0, now(), NULL, NULL, NULL)
    RETURNING "Id" INTO v_report2;

    -- T01: valid report inserts (fixtures reaching here means success).
    v_passed := v_passed + 1;
    RAISE NOTICE 'PASS T01: valid users, category, location, and reports inserted.';

    -- T02: multiple Pending claims on one report should be allowed.
    INSERT INTO public."Claims"
      ("ItemReportId","ClaimantId","ProofOfOwnership","Status","CreatedAt",
       "DecisionReason","ReviewedById","ReviewedAt")
    VALUES
      (v_report1, v_user2, 'Temporary test proof A', 0, now(), NULL, NULL, NULL)
    RETURNING "Id" INTO v_claim1;

    INSERT INTO public."Claims"
      ("ItemReportId","ClaimantId","ProofOfOwnership","Status","CreatedAt",
       "DecisionReason","ReviewedById","ReviewedAt")
    VALUES
      (v_report1, v_user3, 'Temporary test proof B', 0, now(), NULL, NULL, NULL);

    v_passed := v_passed + 1;
    RAISE NOTICE 'PASS T02: multiple Pending claims are allowed for one report.';

    -- T03: same claimant cannot claim the same report twice, even if rejected.
    BEGIN
      INSERT INTO public."Claims"
        ("ItemReportId","ClaimantId","ProofOfOwnership","Status","CreatedAt")
      VALUES (v_report1, v_user2, 'Duplicate claim test', 2, now());
      RAISE EXCEPTION 'T03 FAIL: duplicate claimant/report claim was accepted.';
    EXCEPTION WHEN unique_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T03: duplicate claim for same report and claimant was rejected.';
    END;

    -- T04: at most one Approved (Status=1) claim per report.
    UPDATE public."Claims" SET "Status" = 1 WHERE "Id" = v_claim1;
    BEGIN
      INSERT INTO public."Claims"
        ("ItemReportId","ClaimantId","ProofOfOwnership","Status","CreatedAt")
      VALUES (v_report1, v_user3, 'Second approved claim test', 1, now());
      RAISE EXCEPTION 'T04 FAIL: second approved claim for same report was accepted.';
    EXCEPTION WHEN unique_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T04: second Approved claim for the same report was rejected.';
    END;

    -- T05: valid photo insert.
    INSERT INTO public."Photos"
      ("ItemReportId","StorageKey","ContentType","SizeBytes","CreatedAt","DeleteAfter","DeletedAt")
    VALUES (v_report1, v_storage, 'image/jpeg', 1024, now(), NULL, NULL)
    RETURNING "Id" INTO v_photo;

    v_passed := v_passed + 1;
    RAISE NOTICE 'PASS T05: one photo row inserted for a report.';

    -- T06: second photo row for same report must fail (unique ItemReportId).
    BEGIN
      INSERT INTO public."Photos"
        ("ItemReportId","StorageKey","ContentType","SizeBytes","CreatedAt")
      VALUES (v_report1, v_storage || '-second', 'image/jpeg', 1024, now());
      RAISE EXCEPTION 'T06 FAIL: second photo row for one report was accepted.';
    EXCEPTION WHEN unique_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T06: second photo row for same report was rejected.';
    END;

    -- T07: StorageKey must be unique across different reports.
    BEGIN
      INSERT INTO public."Photos"
        ("ItemReportId","StorageKey","ContentType","SizeBytes","CreatedAt")
      VALUES (v_report2, v_storage, 'image/jpeg', 1024, now());
      RAISE EXCEPTION 'T07 FAIL: duplicate StorageKey was accepted.';
    EXCEPTION WHEN unique_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T07: duplicate photo StorageKey was rejected.';
    END;

    -- T08: bad CategoryId must be rejected by the foreign key.
    BEGIN
      INSERT INTO public."ItemReports"
        ("ReporterId","ReportType","Title","Description","CategoryId","LocationId",
         "EventDate","Status","CreatedAt")
      VALUES (v_user1, 1, 'Bad FK test', 'Should fail', -2147483000, v_loc,
              CURRENT_DATE, 0, now());
      RAISE EXCEPTION 'T08 FAIL: invalid CategoryId was accepted.';
    EXCEPTION WHEN foreign_key_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T08: invalid CategoryId was rejected.';
    END;

    -- T09: deleting a referenced category must be rejected (NO ACTION / ClientNoAction).
    BEGIN
      DELETE FROM public."Categories" WHERE "Id" = v_cat;
      RAISE EXCEPTION 'T09 FAIL: referenced Category was deleted.';
    EXCEPTION WHEN foreign_key_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T09: deletion of a referenced Category was rejected.';
    END;

    -- T10: deleting a referenced report must be rejected while claims/photos reference it.
    BEGIN
      DELETE FROM public."ItemReports" WHERE "Id" = v_report1;
      RAISE EXCEPTION 'T10 FAIL: report with dependent claims/photo was deleted.';
    EXCEPTION WHEN foreign_key_violation THEN
      v_passed := v_passed + 1;
      RAISE NOTICE 'PASS T10: deletion of a report with dependent rows was rejected.';
    END;

    RAISE NOTICE 'JINF DB TEST SUMMARY: % tests passed. Test rows are rolled back by the script.', v_passed;
END $$;

ROLLBACK;


