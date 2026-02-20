-- Allow multiple periods with same seconds (e.g. 60s/20% and 60s/50%)
ALTER TABLE features_periods DROP INDEX uk_period_seconds;
