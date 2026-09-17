# frozen_string_literal: true

require "base64"
require "json"

module CursorPagination
  DEFAULT_LIMIT = 30
  MAX_LIMIT     = 100

  def self.paginate(scope, cursor:, limit:)
    limit = normalize_limit(limit)

    table = scope.arel_table

    # Qualify columns with the table name so JOINed queries don't produce
    # ambiguous column errors.
    scope = scope.reorder(table[:created_at].desc, table[:id].desc)

    if cursor.present?
      decoded = decode_cursor(cursor)
      if decoded
        # PostgreSQL row-comparison: (a, b) < (x, y). We cast explicitly
        # because Postgres doesn't always infer types from Rails bindings
        # for row comparisons.
        scope = scope.where(
          "(#{table.name}.created_at, #{table.name}.id) < (?::timestamptz, ?::uuid)",
          decoded[:created_at],
          decoded[:id]
        )
      end
    end

    rows = scope.limit(limit + 1).to_a
    has_more = rows.length > limit
    rows = rows.first(limit)

    next_cursor = has_more ? encode_cursor(rows.last) : nil

    {
      records:     rows,
      next_cursor: next_cursor,
      has_more:    has_more
    }
  end

  # Opaque, URL-safe cursor. Internally a JSON object:
  #   { "t" => "2026-09-17T11:23:50.027746Z", "id" => "uuid" }
  # Base64-encoded so clients treat it as an opaque token.
  def self.encode_cursor(record)
    payload = {
      t:  record.created_at.utc.iso8601(6),
      id: record.id
    }
    Base64.urlsafe_encode64(payload.to_json, padding: false)
  end

  def self.decode_cursor(cursor)
    json = Base64.urlsafe_decode64(cursor.to_s)
    payload = JSON.parse(json)
    {
      created_at: Time.zone.parse(payload.fetch("t")),
      id:         payload.fetch("id")
    }
  rescue ArgumentError, TypeError, JSON::ParserError, KeyError
    nil
  end

  def self.normalize_limit(value)
    n = value.to_i
    return DEFAULT_LIMIT if n <= 0
    return MAX_LIMIT     if n > MAX_LIMIT
    n
  end
end
