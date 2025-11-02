from os.path import commonprefix

WORD_LENGTH = 5

def main() -> None:
	with open("../data/word_lists/words_acceptable.txt", "r") as f:
		WORDS_ACCEPTABLE = [word for word in f.read().rstrip().split("\n")]

	with open("../data/word_lists/nonwords.txt", "r") as f:
		NONWORDS = [nonword for nonword in f.read().rstrip().split("\n")]

	words = sorted([
		*[[word, 0] for word in WORDS_ACCEPTABLE],
		*[[nonword, 1] for nonword in NONWORDS]
	], key=lambda item: item[0])

	last_word = None
	last_type = None

	with open("./words.dat", mode="wb") as f:
		for word, type in words:
			if last_word:
				common_prefix_length = len(commonprefix([word, last_word]))
				breakouts = WORD_LENGTH - common_prefix_length

				f.write((breakouts + (last_type << 3)).to_bytes())
				f.write(word[common_prefix_length:].encode())
			else:
				f.write(word.encode())
				f.write((type << 3).to_bytes())

			last_word, last_type = word, type

		f.write((last_type << 3).to_bytes())

if __name__ == "__main__":
	main()
