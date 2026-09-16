# frozen_string_literal: true

# Minimal offset-based pagination for API list endpoints.
#
# We deliberately do NOT use a pagination gem for Phase 2. Our needs are:
#   - limit/offset queries
#   - standard metadata (current_page, per_page, total_count, total_pages)
#   - a hard cap on per_page
#
# That's ~30 lines. A gem would add hundreds of lines and dependencies
# we don't need yet. If we later want keyset pagination for messages,
# we'll build that separately (as planned).
module Pagination
  DEFAULT_PER_PAGE = 20
  MAX_PER_PAGE = 100

  # @param scope [ActiveRecord::Relation] the query to paginate
  # @param page [Integer, String, nil] requested page (1-based)
  # @param per_page [Integer, String, nil] items per page
  # @return [Hash] { records: ActiveRecord::Relation, meta: Hash }
  def self.paginate(scope, page: nil, per_page: nil)
    page = [page.to_i, 1].max
    per_page = per_page.to_i
    per_page = DEFAULT_PER_PAGE if per_page <= 0
    per_page = MAX_PER_PAGE if per_page > MAX_PER_PAGE

    total_count = scope.count
    total_pages = total_count.zero? ? 0 : (total_count.to_f / per_page).ceil

    records = scope.limit(per_page).offset((page - 1) * per_page)

    {
      records: records,
      meta: {
        current_page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: total_pages
      }
    }
  end
end
