import os
import json

for (_, _1, filenames) in os.walk("."):
	samples = [filename for filename in filenames if filename[-4:] == ".wav"]
	ret = {"samples": samples}
	print(json.dumps(ret))