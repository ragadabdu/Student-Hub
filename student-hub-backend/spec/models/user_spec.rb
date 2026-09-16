# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_one(:profile).dependent(:destroy) }
    it { is_expected.to have_many(:user_interests).dependent(:destroy) }
    it { is_expected.to have_many(:interests).through(:user_interests) }
    it { is_expected.to have_many(:user_skills).dependent(:destroy) }
    it { is_expected.to have_many(:skills).through(:user_skills) }
    it { is_expected.to have_many(:portfolio_links).dependent(:destroy) }
    it { is_expected.to have_many(:projects).dependent(:destroy) }
  end

  describe "validations" do
    subject { build(:user) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_presence_of(:password) }
    it { is_expected.to validate_length_of(:name).is_at_most(100).allow_blank }
  end

  describe "#create_default_profile" do
    it "creates a profile automatically after a user is created" do
      user = create(:user)
      expect(user.profile).to be_present
      expect(user.profile).to be_a(Profile)
    end
  end

  describe "UUID primary key" do
    it "assigns a UUID to the user" do
      user = create(:user)
      expect(user.id).to match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/)
    end
  end
end