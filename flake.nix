{
  description = "Speakless Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";  # Adjust if on ARM (e.g., "aarch64-linux")
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {

        shell = "${pkgs.nushell}/bin/nu";

        buildInputs = [
          pkgs.nodejs_latest
        ];

		shellHook = ''
			echo "Speakless dev shell ready!"
			node --version
			nu
        '';
      };
    };
}

