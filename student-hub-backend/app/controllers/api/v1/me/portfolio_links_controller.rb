# frozen_string_literal: true

module Api
  module V1
    module Me
      class PortfolioLinksController < ApplicationController
        # POST /api/v1/me/portfolio_links
        def create
          link = current_user.portfolio_links.new(portfolio_link_params)

          if link.save
            serialized = ActiveModelSerializers::SerializableResource.new(
              link,
              serializer: PortfolioLinkSerializer
            ).as_json

            render json: serialized, status: :created
          else
            render_error(
              code:    "VALIDATION_ERROR",
              message: "Portfolio link could not be created",
              details: link.errors.to_hash,
              status:  :unprocessable_content
            )
          end
        end

        # DELETE /api/v1/me/portfolio_links/:id
        def destroy
          link = current_user.portfolio_links.find(params[:id])
          link.destroy
          head :no_content
        end

        private

        def portfolio_link_params
          params.require(:portfolio_link).permit(:link_type, :url, :title)
        end
      end
    end
  end
end