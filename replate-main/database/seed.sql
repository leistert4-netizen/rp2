USE replate;

INSERT INTO organizations
    (organization_name, organization_type, address)
VALUES
    ('Replate Demo Restaurant', 'FOODSERVICE', '123 Main Street');

INSERT INTO users
    (organization_id, email, password_hash, role)
VALUES
    (1, 'demo@replate.com', 'demo-password', 'FOOD_DONOR');