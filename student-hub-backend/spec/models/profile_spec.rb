# frozen_string_literal: true

require "rails_helper"

RSpec.describe Profile, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { create(:user).profile }

    it { is_expected.to validate_length_of(:bio).is_at_most(500).allow_blank }
    it { is_expected.to validate_length_of(:tagline).is_at_most(160).allow_blank }
  end

  describe "#age" do
    let(:profile) { create(:user).profile }

    it "returns nil when birthdate is missing" do
      profile.birthdate = nil
      expect(profile.age).to be_nil
    end

    it "computes age correctly for a birthday already occurred this year" do
      profile.birthdate = 20.years.ago.to_date
      expect(profile.age).to eq(20)
    end

    it "computes age correctly for a birthday not yet occurred this year" do
      profile.birthdate = 20.years.ago.to_date + 1.day
      expect(profile.age).to eq(19)
    end
  end
end